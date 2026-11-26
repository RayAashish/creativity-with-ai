package com.raysi.anchor.downloader;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pure-Java byte-range partitioning, resume offset verification, and segment serialization helpers.
 */
public final class ByteRangeMath {

    public static final long MULTI_SEGMENT_THRESHOLD_BYTES = 4L * 1024L * 1024L; // 4 MB
    public static final int DEFAULT_WORKERS = 4;

    private static final Pattern CONTENT_RANGE_TOTAL = Pattern.compile("/(\\d+)\\s*$");

    private ByteRangeMath() {
    }

    public static final class SegmentState {
        public final long startByte;
        public final long endByte;
        public volatile long currentOffset;

        public SegmentState(long startByte, long endByte, long currentOffset) {
            this.startByte = startByte;
            this.endByte = endByte;
            this.currentOffset = currentOffset;
        }

        public boolean isCompleted() {
            return endByte >= startByte && currentOffset > endByte;
        }

        public long downloadedBytes() {
            return Math.max(0L, currentOffset - startByte);
        }

        public long remainingBytes() {
            if (endByte < startByte) {
                return -1L;
            }
            return Math.max(0L, (endByte - currentOffset) + 1L);
        }
    }

    @NonNull
    public static List<SegmentState> buildSegments(long totalBytes, boolean acceptRanges, int workerCount) {
        List<SegmentState> segments = new ArrayList<>();
        if (totalBytes <= 0) {
            segments.add(new SegmentState(0L, -1L, 0L));
            return segments;
        }
        if (!acceptRanges || totalBytes <= MULTI_SEGMENT_THRESHOLD_BYTES || workerCount <= 1) {
            segments.add(new SegmentState(0L, totalBytes - 1L, 0L));
            return segments;
        }

        int workers = Math.min(workerCount, (int) Math.min(Integer.MAX_VALUE, totalBytes));
        long baseChunk = totalBytes / workers;
        long cursor = 0L;
        for (int i = 0; i < workers; i++) {
            long end = (i == workers - 1) ? (totalBytes - 1L) : (cursor + baseChunk - 1L);
            segments.add(new SegmentState(cursor, end, cursor));
            cursor = end + 1L;
        }
        return segments;
    }

    public static long sumDownloaded(@NonNull List<SegmentState> segments) {
        long sum = 0L;
        for (SegmentState s : segments) {
            sum += s.downloadedBytes();
        }
        return sum;
    }

    public static boolean allCompleted(@NonNull List<SegmentState> segments) {
        if (segments.isEmpty()) {
            return false;
        }
        for (SegmentState s : segments) {
            if (!s.isCompleted()) {
                return false;
            }
        }
        return true;
    }

    public static int computePercent(long downloadedBytes, long totalBytes) {
        if (totalBytes <= 0 || downloadedBytes <= 0) {
            return 0;
        }
        if (downloadedBytes >= totalBytes) {
            return 100;
        }
        return (int) Math.min(100L, (downloadedBytes * 100L) / totalBytes);
    }

    @NonNull
    public static String formatRangeHeader(long startOffset, long endByteInclusive) {
        if (endByteInclusive >= startOffset) {
            return "bytes=" + startOffset + "-" + endByteInclusive;
        }
        return "bytes=" + startOffset + "-";
    }

    public static long parseContentRangeTotalBytes(@Nullable String contentRangeHeader) {
        if (contentRangeHeader == null || contentRangeHeader.isBlank()) {
            return -1L;
        }
        Matcher matcher = CONTENT_RANGE_TOTAL.matcher(contentRangeHeader.trim());
        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException ignored) {
                return -1L;
            }
        }
        return -1L;
    }

    public static boolean canResume(
            long persistedDownloadedBytes,
            long persistedTotalBytes,
            @Nullable String persistedETag,
            long probeTotalBytes,
            @Nullable String probeETag,
            boolean probeAcceptRanges
    ) {
        if (persistedDownloadedBytes <= 0 || !probeAcceptRanges) {
            return false;
        }
        if (persistedTotalBytes > 0 && probeTotalBytes > 0 && persistedTotalBytes != probeTotalBytes) {
            return false;
        }
        if (persistedETag != null && !persistedETag.isBlank()
                && probeETag != null && !probeETag.isBlank()
                && !persistedETag.equals(probeETag)) {
            return false;
        }
        return true;
    }

    @NonNull
    public static String toJson(@NonNull List<SegmentState> segments) {
        JSONArray array = new JSONArray();
        for (SegmentState s : segments) {
            JSONObject obj = new JSONObject();
            try {
                obj.put("s", s.startByte);
                obj.put("e", s.endByte);
                obj.put("c", s.currentOffset);
                array.put(obj);
            } catch (JSONException ignored) {
            }
        }
        return array.toString();
    }

    @NonNull
    public static List<SegmentState> fromJson(@Nullable String json) {
        List<SegmentState> list = new ArrayList<>();
        if (json == null || json.isBlank()) {
            return list;
        }
        try {
            JSONArray array = new JSONArray(json);
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.optJSONObject(i);
                if (obj != null) {
                    list.add(new SegmentState(
                            obj.optLong("s", 0L),
                            obj.optLong("e", -1L),
                            obj.optLong("c", 0L)
                    ));
                }
            }
        } catch (JSONException ignored) {
            list.clear();
        }
        return list;
    }
}
