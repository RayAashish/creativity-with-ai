package com.raysi.anchor.downloader;

import android.content.Context;
import android.net.Uri;
import android.os.ParcelFileDescriptor;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.raysi.anchor.data.db.AppDatabase;
import com.raysi.anchor.data.db.DownloadDao;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.data.db.DownloadStatus;
import com.raysi.anchor.extractor.ExtractorRegistry;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.network.NetworkModule;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Multi-segment, byte-range resumable download engine writing zero-copy directly into Android MediaStore.
 */
public final class DownloadEngine {

    public interface Listener {
        void onProgressUpdate(int activeCount, @Nullable String activeTitle, int percent);

        void onDownloadCompleted(DownloadEntity entity);

        void onDownloadFailed(DownloadEntity entity, String reason);

        void onQueueDrained();
    }

    private static final int BUFFER_SIZE = 32 * 1024;
    private static final long DB_PERSIST_INTERVAL_MS = 900L;

    private static volatile DownloadEngine instance;

    private final Context appContext;
    private final DownloadDao dao;
    private final OkHttpClient httpClient;
    private final TransferSpeedBus speedBus;
    private final ExecutorService coordinatorExecutor = Executors.newFixedThreadPool(2);
    private final ExecutorService segmentWorkerPool = Executors.newFixedThreadPool(ByteRangeMath.DEFAULT_WORKERS);
    private final ConcurrentHashMap<Long, ActiveJob> activeJobs = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();

    private DownloadEngine(@NonNull Context context) {
        this.appContext = context.getApplicationContext();
        this.dao = AppDatabase.getInstance(this.appContext).downloadDao();
        this.httpClient = NetworkModule.getClient();
        this.speedBus = TransferSpeedBus.getInstance();
    }

    @NonNull
    public static DownloadEngine getInstance(@NonNull Context context) {
        DownloadEngine local = instance;
        if (local == null) {
            synchronized (DownloadEngine.class) {
                local = instance;
                if (local == null) {
                    local = new DownloadEngine(context);
                    instance = local;
                }
            }
        }
        return local;
    }

    public void addListener(@NonNull Listener listener) {
        listeners.addIfAbsent(listener);
    }

    public void removeListener(@NonNull Listener listener) {
        listeners.remove(listener);
    }

    public void reconcileInterruptedOnStartup() {
        coordinatorExecutor.execute(() -> {
            List<DownloadEntity> interrupted = dao.findPendingOrActive();
            for (DownloadEntity entity : interrupted) {
                if (!activeJobs.containsKey(entity.id)) {
                    dao.updateStatus(entity.id, DownloadStatus.PAUSED, null);
                }
            }
        });
    }

    public void startOrResume(long downloadId) {
        coordinatorExecutor.execute(() -> {
            if (activeJobs.containsKey(downloadId)) {
                return;
            }
            DownloadEntity entity = dao.findById(downloadId);
            if (entity == null || entity.status == DownloadStatus.COMPLETED) {
                notifyIfQueueDrained();
                return;
            }
            ActiveJob job = new ActiveJob(downloadId);
            if (activeJobs.putIfAbsent(downloadId, job) != null) {
                return;
            }
            runDownloadJob(entity, job);
        });
    }

    public void pause(long downloadId) {
        ActiveJob job = activeJobs.get(downloadId);
        if (job != null) {
            job.pauseRequested.set(true);
            job.cancelHttpCalls();
        } else {
            coordinatorExecutor.execute(() -> {
                DownloadEntity entity = dao.findById(downloadId);
                if (entity != null && entity.status != DownloadStatus.COMPLETED) {
                    dao.updateStatus(downloadId, DownloadStatus.PAUSED, null);
                    speedBus.clear(downloadId);
                    notifyIfQueueDrained();
                }
            });
        }
    }

    public void cancel(long downloadId) {
        ActiveJob job = activeJobs.get(downloadId);
        if (job != null) {
            job.cancelRequested.set(true);
            job.cancelHttpCalls();
        } else {
            coordinatorExecutor.execute(() -> cleanupCancelledEntity(downloadId));
        }
    }

    public void pauseAll() {
        for (Long id : activeJobs.keySet()) {
            pause(id);
        }
        coordinatorExecutor.execute(() -> {
            for (DownloadEntity entity : dao.findPendingOrActive()) {
                if (!activeJobs.containsKey(entity.id)) {
                    dao.updateStatus(entity.id, DownloadStatus.PAUSED, null);
                }
            }
            notifyIfQueueDrained();
        });
    }

    public void cancelAll() {
        for (Long id : activeJobs.keySet()) {
            cancel(id);
        }
        coordinatorExecutor.execute(() -> {
            for (DownloadEntity entity : dao.findPendingOrActive()) {
                if (!activeJobs.containsKey(entity.id)) {
                    cleanupCancelledEntity(entity.id);
                }
            }
            notifyIfQueueDrained();
        });
    }

    public int getActiveCount() {
        return activeJobs.size();
    }

    private void runDownloadJob(DownloadEntity entity, ActiveJob job) {
        try {
            dao.updateStatus(entity.id, DownloadStatus.DOWNLOADING, null);

            ProbeResult probe = probeOrRefreshUrl(entity, job);
            if (job.isInterrupted()) {
                handleInterruption(entity, job, null, null);
                return;
            }
            if (!probe.ok) {
                markFailed(entity, probe.errorMessage != null ? probe.errorMessage : "Media URL is unreachable.");
                return;
            }

            // Ensure zero-copy MediaStore entry exists
            if (entity.mediaStoreUri == null || entity.mediaStoreUri.isBlank()) {
                Uri createdUri = MediaStoreStorage.createPendingEntry(appContext, entity.title, entity.mimeType);
                entity.mediaStoreUri = createdUri.toString();
                dao.updateMediaStoreUri(entity.id, entity.mediaStoreUri);
            }

            Uri targetUri = Uri.parse(entity.mediaStoreUri);
            try (ParcelFileDescriptor pfd = MediaStoreStorage.openReadWrite(appContext, targetUri);
                 FileOutputStream fos = new FileOutputStream(pfd.getFileDescriptor());
                 FileChannel fileChannel = fos.getChannel()) {

                List<ByteRangeMath.SegmentState> persistedSegments = ByteRangeMath.fromJson(entity.segmentsJson);
                boolean canResumeExisting = entity.downloadedBytes > 0
                        && !persistedSegments.isEmpty()
                        && ByteRangeMath.canResume(
                        entity.downloadedBytes,
                        entity.totalBytes,
                        entity.eTag,
                        probe.totalBytes,
                        probe.eTag,
                        probe.acceptRanges
                );

                List<ByteRangeMath.SegmentState> segments;
                if (canResumeExisting) {
                    segments = persistedSegments;
                    if (probe.totalBytes > 0) {
                        entity.totalBytes = probe.totalBytes;
                    }
                } else {
                    // Fresh transfer or server invalidated ETag/Content-Length
                    entity.downloadedBytes = 0L;
                    entity.totalBytes = probe.totalBytes;
                    entity.eTag = probe.eTag;
                    entity.lastModified = probe.lastModified;
                    if (fileChannel.size() > 0) {
                        fileChannel.truncate(0L);
                    }
                    segments = ByteRangeMath.buildSegments(
                            probe.totalBytes,
                            probe.acceptRanges,
                            ByteRangeMath.DEFAULT_WORKERS
                    );
                    dao.updateRefreshDetails(entity.id, entity.resolvedMediaUrl, entity.eTag, entity.lastModified, entity.totalBytes);
                }

                String initialSegmentsJson = ByteRangeMath.toJson(segments);
                dao.updateProgress(entity.id, ByteRangeMath.sumDownloaded(segments), entity.totalBytes, initialSegmentsJson);

                boolean completed;
                if (segments.size() > 1 && probe.acceptRanges && entity.totalBytes > 0) {
                    completed = executeMultiSegmentDownload(entity, job, fileChannel, segments);
                } else {
                    completed = executeSingleStreamDownload(entity, job, fileChannel, segments.get(0), probe.acceptRanges);
                }

                if (job.isInterrupted()) {
                    handleInterruption(entity, job, segments, fileChannel);
                    return;
                }

                if (completed) {
                    fileChannel.force(false);
                    long finalDownloaded = ByteRangeMath.sumDownloaded(segments);
                    if (entity.totalBytes <= 0) {
                        entity.totalBytes = finalDownloaded;
                    }
                    entity.downloadedBytes = finalDownloaded;
                    entity.segmentsJson = ByteRangeMath.toJson(segments);
                    dao.updateProgress(entity.id, entity.downloadedBytes, entity.totalBytes, entity.segmentsJson);
                    MediaStoreStorage.markCompleted(appContext, entity.mediaStoreUri, entity.mimeType);
                    dao.updateStatus(entity.id, DownloadStatus.COMPLETED, null);
                    entity.status = DownloadStatus.COMPLETED;
                    speedBus.clear(entity.id);
                    for (Listener l : listeners) {
                        l.onDownloadCompleted(entity);
                    }
                }
            }
        } catch (Exception e) {
            if (job.isInterrupted()) {
                handleInterruption(entity, job, null, null);
            } else {
                markFailed(entity, e.getMessage() != null ? e.getMessage() : "Download error.");
            }
        } finally {
            activeJobs.remove(entity.id);
            notifyIfQueueDrained();
        }
    }

    private boolean executeMultiSegmentDownload(
            DownloadEntity entity,
            ActiveJob job,
            FileChannel fileChannel,
            List<ByteRangeMath.SegmentState> segments
    ) throws Exception {
        AtomicLong totalWritten = new AtomicLong(ByteRangeMath.sumDownloaded(segments));
        SpeedMeter speedMeter = new SpeedMeter(totalWritten.get());
        Object dbSyncLock = new Object();
        AtomicLong lastDbPersistMs = new AtomicLong(System.currentTimeMillis());

        List<Callable<Void>> tasks = new ArrayList<>();
        for (ByteRangeMath.SegmentState seg : segments) {
            if (seg.isCompleted()) {
                continue;
            }
            tasks.add(() -> {
                streamSegmentRange(entity, job, fileChannel, seg, segments, totalWritten, speedMeter, dbSyncLock, lastDbPersistMs);
                return null;
            });
        }

        List<Future<Void>> futures = new ArrayList<>();
        for (Callable<Void> task : tasks) {
            futures.add(segmentWorkerPool.submit(task));
        }

        Exception firstFailure = null;
        for (Future<Void> f : futures) {
            try {
                f.get();
            } catch (Exception e) {
                if (firstFailure == null) {
                    firstFailure = e;
                    job.cancelHttpCalls();
                }
            }
        }

        if (firstFailure != null && !job.isInterrupted()) {
            throw firstFailure;
        }
        return !job.isInterrupted() && ByteRangeMath.allCompleted(segments);
    }

    private void streamSegmentRange(
            DownloadEntity entity,
            ActiveJob job,
            FileChannel fileChannel,
            ByteRangeMath.SegmentState segment,
            List<ByteRangeMath.SegmentState> allSegments,
            AtomicLong totalWritten,
            SpeedMeter speedMeter,
            Object dbSyncLock,
            AtomicLong lastDbPersistMs
    ) throws IOException {
        if (job.isInterrupted() || segment.isCompleted()) {
            return;
        }

        String ifRange = (entity.eTag != null && !entity.eTag.isBlank()) ? entity.eTag : entity.lastModified;
        Request request = NetworkModule.newMediaDownloadRequest(
                entity.resolvedMediaUrl,
                entity.sourceUrl,
                segment.currentOffset,
                segment.endByte,
                ifRange
        );
        Call call = httpClient.newCall(request);
        job.trackCall(call);

        try (Response response = call.execute()) {
            if (job.isInterrupted()) {
                return;
            }
            if (response.code() != 206 && !(segment.startByte == 0 && response.isSuccessful())) {
                throw new IOException("Server returned HTTP " + response.code() + " for byte range.");
            }
            ResponseBody body = response.body();
            if (body == null) {
                throw new IOException("Empty response body from CDN.");
            }

            byte[] buffer = new byte[BUFFER_SIZE];
            try (InputStream is = body.byteStream()) {
                int read;
                while (!job.isInterrupted() && (read = is.read(buffer)) != -1) {
                    int toWrite = read;
                    if (segment.endByte >= segment.startByte) {
                        long remaining = (segment.endByte - segment.currentOffset) + 1L;
                        if (remaining <= 0) {
                            break;
                        }
                        toWrite = (int) Math.min(read, remaining);
                    }
                    ByteBuffer bb = ByteBuffer.wrap(buffer, 0, toWrite);
                    long writePos = segment.currentOffset;
                    while (bb.hasRemaining()) {
                        int written = fileChannel.write(bb, writePos);
                        writePos += written;
                    }
                    segment.currentOffset = writePos;
                    long totalNow = totalWritten.addAndGet(toWrite);
                    long speed = speedMeter.update(totalNow);
                    speedBus.publish(entity.id, totalNow, entity.totalBytes, speed, false);
                    notifyProgressListeners(entity, totalNow);

                    long now = System.currentTimeMillis();
                    if (now - lastDbPersistMs.get() >= DB_PERSIST_INTERVAL_MS) {
                        synchronized (dbSyncLock) {
                            if (now - lastDbPersistMs.get() >= DB_PERSIST_INTERVAL_MS) {
                                lastDbPersistMs.set(now);
                                dao.updateProgress(entity.id, totalNow, entity.totalBytes, ByteRangeMath.toJson(allSegments));
                            }
                        }
                    }
                }
            }
        }
    }

    private boolean executeSingleStreamDownload(
            DownloadEntity entity,
            ActiveJob job,
            FileChannel fileChannel,
            ByteRangeMath.SegmentState segment,
            boolean acceptRanges
    ) throws IOException {
        long rangeStart = (segment.currentOffset > 0 && acceptRanges) ? segment.currentOffset : -1L;
        String ifRange = (rangeStart > 0 && entity.eTag != null && !entity.eTag.isBlank())
                ? entity.eTag
                : (rangeStart > 0 ? entity.lastModified : null);

        Request request = NetworkModule.newMediaDownloadRequest(
                entity.resolvedMediaUrl,
                entity.sourceUrl,
                rangeStart,
                -1L,
                ifRange
        );
        Call call = httpClient.newCall(request);
        job.trackCall(call);

        try (Response response = call.execute()) {
            if (job.isInterrupted()) {
                return false;
            }
            if (!response.isSuccessful()) {
                throw new IOException("CDN returned HTTP " + response.code());
            }

            // If we asked for Range but server sent full 200 OK, reset file to offset 0 cleanly
            if (rangeStart > 0 && response.code() == 200) {
                fileChannel.truncate(0L);
                segment.currentOffset = 0L;
            }

            if (entity.totalBytes <= 0) {
                long len = parseLongHeader(response.header("Content-Length"));
                if (response.code() == 206) {
                    long parsedTotal = ByteRangeMath.parseContentRangeTotalBytes(response.header("Content-Range"));
                    entity.totalBytes = parsedTotal > 0 ? parsedTotal : len;
                } else {
                    entity.totalBytes = len;
                }
                if (entity.totalBytes > 0) {
                    segment = new ByteRangeMath.SegmentState(0L, entity.totalBytes - 1L, segment.currentOffset);
                }
            }

            ResponseBody body = response.body();
            if (body == null) {
                throw new IOException("Empty media body.");
            }

            List<ByteRangeMath.SegmentState> singleList = List.of(segment);
            SpeedMeter speedMeter = new SpeedMeter(segment.currentOffset);
            long lastPersistMs = System.currentTimeMillis();
            byte[] buffer = new byte[BUFFER_SIZE];

            try (InputStream is = body.byteStream()) {
                int read;
                while (!job.isInterrupted() && (read = is.read(buffer)) != -1) {
                    ByteBuffer bb = ByteBuffer.wrap(buffer, 0, read);
                    long writePos = segment.currentOffset;
                    while (bb.hasRemaining()) {
                        int written = fileChannel.write(bb, writePos);
                        writePos += written;
                    }
                    segment.currentOffset = writePos;
                    long speed = speedMeter.update(writePos);
                    speedBus.publish(entity.id, writePos, entity.totalBytes, speed, false);
                    notifyProgressListeners(entity, writePos);

                    long now = System.currentTimeMillis();
                    if (now - lastPersistMs >= DB_PERSIST_INTERVAL_MS) {
                        lastPersistMs = now;
                        dao.updateProgress(entity.id, writePos, entity.totalBytes, ByteRangeMath.toJson(singleList));
                    }
                }
            }

            if (!job.isInterrupted()) {
                entity.downloadedBytes = segment.currentOffset;
                if (entity.totalBytes <= 0) {
                    entity.totalBytes = segment.currentOffset;
                }
                entity.segmentsJson = ByteRangeMath.toJson(List.of(
                        new ByteRangeMath.SegmentState(0L, entity.totalBytes - 1L, entity.totalBytes)
                ));
                return true;
            }
            entity.downloadedBytes = segment.currentOffset;
            entity.segmentsJson = ByteRangeMath.toJson(singleList);
            return false;
        }
    }

    /**
     * Verifies the CDN link with HEAD; if expired (401/403/404/410), refreshes via ExtractorRegistry
     * while preserving downloadedBytes and segment offsets.
     */
    private ProbeResult probeOrRefreshUrl(DownloadEntity entity, ActiveJob job) {
        ProbeResult firstProbe = executeHeadProbe(entity.resolvedMediaUrl, entity.sourceUrl, job);
        if (firstProbe.ok || job.isInterrupted()) {
            return firstProbe;
        }
        if (firstProbe.httpCode == 401 || firstProbe.httpCode == 403
                || firstProbe.httpCode == 404 || firstProbe.httpCode == 410) {
            ExtractionResult refreshed = ExtractorRegistry.getDefault().resolveAndExtract(entity.sourceUrl, false);
            if (refreshed instanceof ExtractionResult.Success success) {
                MediaVariant chosen = pickMatchingVariant(success.getVariants(), entity.qualityLabel, entity.mimeType);
                entity.resolvedMediaUrl = chosen.getUrl();
                ProbeResult retryProbe = executeHeadProbe(entity.resolvedMediaUrl, entity.sourceUrl, job);
                if (retryProbe.ok) {
                    dao.updateRefreshDetails(
                            entity.id,
                            entity.resolvedMediaUrl,
                            retryProbe.eTag != null ? retryProbe.eTag : entity.eTag,
                            retryProbe.lastModified != null ? retryProbe.lastModified : entity.lastModified,
                            retryProbe.totalBytes > 0 ? retryProbe.totalBytes : entity.totalBytes
                    );
                }
                return retryProbe;
            }
        }
        return firstProbe;
    }

    private ProbeResult executeHeadProbe(String url, String referer, ActiveJob job) {
        Call headCall = httpClient.newCall(NetworkModule.newMediaProbeRequest(url, referer));
        job.trackCall(headCall);
        try (Response response = headCall.execute()) {
            if (response.isSuccessful()) {
                long len = parseLongHeader(response.header("Content-Length"));
                String acceptRangesHeader = response.header("Accept-Ranges", "");
                boolean acceptRanges = acceptRangesHeader != null
                        && acceptRangesHeader.toLowerCase(Locale.ROOT).contains("bytes");
                String eTag = response.header("ETag");
                String lastModified = response.header("Last-Modified");
                return ProbeResult.success(len, acceptRanges, eTag, lastModified);
            }
            // Some CDNs reject HEAD with 405 Method Not Allowed — probe byte 0-0 with GET
            if (response.code() == 405 || response.code() == 501) {
                return executeZeroByteRangeProbe(url, referer, job);
            }
            return ProbeResult.failure(response.code(), "CDN returned HTTP " + response.code());
        } catch (IOException e) {
            return ProbeResult.failure(-1, e.getMessage() != null ? e.getMessage() : "Network error");
        }
    }

    private ProbeResult executeZeroByteRangeProbe(String url, String referer, ActiveJob job) {
        Call call = httpClient.newCall(NetworkModule.newMediaDownloadRequest(url, referer, 0L, 0L, null));
        job.trackCall(call);
        try (Response response = call.execute()) {
            if (response.code() == 206) {
                long total = ByteRangeMath.parseContentRangeTotalBytes(response.header("Content-Range"));
                return ProbeResult.success(total, true, response.header("ETag"), response.header("Last-Modified"));
            }
            if (response.isSuccessful()) {
                long len = parseLongHeader(response.header("Content-Length"));
                return ProbeResult.success(len, false, response.header("ETag"), response.header("Last-Modified"));
            }
            return ProbeResult.failure(response.code(), "CDN returned HTTP " + response.code());
        } catch (IOException e) {
            return ProbeResult.failure(-1, e.getMessage() != null ? e.getMessage() : "Network error");
        }
    }

    private MediaVariant pickMatchingVariant(List<MediaVariant> variants, String qualityLabel, String mimeType) {
        for (MediaVariant v : variants) {
            if (v.getLabel().equalsIgnoreCase(qualityLabel)) {
                return v;
            }
        }
        for (MediaVariant v : variants) {
            if (v.getMimeType().equalsIgnoreCase(mimeType)) {
                return v;
            }
        }
        return variants.get(0);
    }

    private void handleInterruption(
            DownloadEntity entity,
            ActiveJob job,
            @Nullable List<ByteRangeMath.SegmentState> segments,
            @Nullable FileChannel channel
    ) {
        if (channel != null) {
            try {
                channel.force(false);
            } catch (IOException ignored) {
            }
        }
        if (job.cancelRequested.get()) {
            cleanupCancelledEntity(entity.id);
        } else if (job.pauseRequested.get()) {
            if (segments != null && !segments.isEmpty()) {
                long sum = ByteRangeMath.sumDownloaded(segments);
                entity.downloadedBytes = sum;
                entity.segmentsJson = ByteRangeMath.toJson(segments);
                dao.updateProgress(entity.id, sum, entity.totalBytes, entity.segmentsJson);
            }
            dao.updateStatus(entity.id, DownloadStatus.PAUSED, null);
            speedBus.clear(entity.id);
        }
    }

    private void cleanupCancelledEntity(long downloadId) {
        DownloadEntity existing = dao.findById(downloadId);
        if (existing != null) {
            MediaStoreStorage.deleteEntry(appContext, existing.mediaStoreUri);
            dao.deleteById(downloadId);
        }
        speedBus.clear(downloadId);
    }

    private void markFailed(DownloadEntity entity, String reason) {
        dao.updateStatus(entity.id, DownloadStatus.FAILED, reason);
        speedBus.clear(entity.id);
        for (Listener l : listeners) {
            l.onDownloadFailed(entity, reason);
        }
    }

    private void notifyProgressListeners(DownloadEntity entity, long downloadedNow) {
        int pct = ByteRangeMath.computePercent(downloadedNow, entity.totalBytes);
        int count = Math.max(1, activeJobs.size());
        for (Listener l : listeners) {
            l.onProgressUpdate(count, entity.title, pct);
        }
    }

    private void notifyIfQueueDrained() {
        if (activeJobs.isEmpty() && dao.countPendingOrActive() == 0) {
            for (Listener l : listeners) {
                l.onQueueDrained();
            }
        }
    }

    private static long parseLongHeader(@Nullable String value) {
        if (value == null) {
            return -1L;
        }
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            return -1L;
        }
    }

    private static final class ActiveJob {
        final long downloadId;
        final AtomicBoolean pauseRequested = new AtomicBoolean(false);
        final AtomicBoolean cancelRequested = new AtomicBoolean(false);
        final CopyOnWriteArrayList<Call> activeCalls = new CopyOnWriteArrayList<>();

        ActiveJob(long downloadId) {
            this.downloadId = downloadId;
        }

        void trackCall(Call call) {
            activeCalls.add(call);
            if (isInterrupted()) {
                call.cancel();
            }
        }

        void cancelHttpCalls() {
            for (Call call : activeCalls) {
                call.cancel();
            }
        }

        boolean isInterrupted() {
            return pauseRequested.get() || cancelRequested.get();
        }
    }

    private static final class SpeedMeter {
        private long windowStartMs;
        private long windowStartBytes;
        private long ewmaBytesPerSec;

        SpeedMeter(long initialBytes) {
            this.windowStartMs = System.currentTimeMillis();
            this.windowStartBytes = initialBytes;
        }

        synchronized long update(long currentBytes) {
            long now = System.currentTimeMillis();
            long elapsedMs = now - windowStartMs;
            if (elapsedMs >= 450L) {
                long deltaBytes = Math.max(0L, currentBytes - windowStartBytes);
                long instantBps = (deltaBytes * 1000L) / Math.max(1L, elapsedMs);
                ewmaBytesPerSec = ewmaBytesPerSec == 0L
                        ? instantBps
                        : (ewmaBytesPerSec * 6L + instantBps * 4L) / 10L;
                windowStartMs = now;
                windowStartBytes = currentBytes;
            }
            return ewmaBytesPerSec;
        }
    }

    private record ProbeResult(
            boolean ok,
            int httpCode,
            long totalBytes,
            boolean acceptRanges,
            @Nullable String eTag,
            @Nullable String lastModified,
            @Nullable String errorMessage
    ) {
        static ProbeResult success(long totalBytes, boolean acceptRanges, @Nullable String eTag, @Nullable String lastModified) {
            return new ProbeResult(true, 200, totalBytes, acceptRanges, eTag, lastModified, null);
        }

        static ProbeResult failure(int code, String message) {
            return new ProbeResult(false, code, -1L, false, null, null, message);
        }
    }
}
