package com.raysi.anchor.downloader;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.raysi.anchor.R;
import com.raysi.anchor.data.db.AppDatabase;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.data.db.DownloadStatus;
import com.raysi.anchor.ui.main.MainActivity;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Foreground service (dataSync) running {@link DownloadEngine} transfers reliably in the background
 * with silent ongoing progress notifications and Pause/Cancel controls.
 */
public final class DownloadForegroundService extends Service implements DownloadEngine.Listener {

    public static final String CHANNEL_ID = "anchor_downloads";
    private static final int NOTIFICATION_ID = 4201;

    public static final String ACTION_ENQUEUE = "com.raysi.anchor.action.ENQUEUE";
    public static final String ACTION_RESUME = "com.raysi.anchor.action.RESUME";
    public static final String ACTION_PAUSE = "com.raysi.anchor.action.PAUSE";
    public static final String ACTION_CANCEL = "com.raysi.anchor.action.CANCEL";
    public static final String ACTION_PAUSE_ALL = "com.raysi.anchor.action.PAUSE_ALL";
    public static final String ACTION_CANCEL_ALL = "com.raysi.anchor.action.CANCEL_ALL";

    public static final String EXTRA_DOWNLOAD_ID = "extra_download_id";
    public static final String EXTRA_SOURCE_URL = "extra_source_url";
    public static final String EXTRA_MEDIA_URL = "extra_media_url";
    public static final String EXTRA_PLATFORM_ID = "extra_platform_id";
    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_QUALITY_LABEL = "extra_quality_label";
    public static final String EXTRA_MIME_TYPE = "extra_mime_type";
    public static final String EXTRA_THUMBNAIL_URL = "extra_thumbnail_url";
    public static final String EXTRA_ESTIMATED_BYTES = "extra_estimated_bytes";

    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private DownloadEngine engine;
    private NotificationManager notificationManager;
    private volatile long lastNotifyMs = 0L;

    public static void ensureChannel(@NonNull Context context) {
        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm == null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.notif_channel_name),
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription(context.getString(R.string.notif_channel_desc));
        channel.setShowBadge(false);
        nm.createNotificationChannel(channel);
    }

    public static void enqueueDownload(
            @NonNull Context context,
            @NonNull String sourceUrl,
            @NonNull String resolvedMediaUrl,
            @NonNull String platformId,
            @NonNull String title,
            @NonNull String qualityLabel,
            @NonNull String mimeType,
            @Nullable String thumbnailUrl,
            long estimatedBytes
    ) {
        Intent intent = new Intent(context, DownloadForegroundService.class);
        intent.setAction(ACTION_ENQUEUE);
        intent.putExtra(EXTRA_SOURCE_URL, sourceUrl);
        intent.putExtra(EXTRA_MEDIA_URL, resolvedMediaUrl);
        intent.putExtra(EXTRA_PLATFORM_ID, platformId);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_QUALITY_LABEL, qualityLabel);
        intent.putExtra(EXTRA_MIME_TYPE, mimeType);
        intent.putExtra(EXTRA_THUMBNAIL_URL, thumbnailUrl);
        intent.putExtra(EXTRA_ESTIMATED_BYTES, estimatedBytes);
        ContextCompat.startForegroundService(context, intent);
    }

    public static void resumeDownload(@NonNull Context context, long downloadId) {
        Intent intent = new Intent(context, DownloadForegroundService.class);
        intent.setAction(ACTION_RESUME);
        intent.putExtra(EXTRA_DOWNLOAD_ID, downloadId);
        ContextCompat.startForegroundService(context, intent);
    }

    public static void pauseDownload(@NonNull Context context, long downloadId) {
        Intent intent = new Intent(context, DownloadForegroundService.class);
        intent.setAction(ACTION_PAUSE);
        intent.putExtra(EXTRA_DOWNLOAD_ID, downloadId);
        context.startService(intent);
    }

    public static void cancelDownload(@NonNull Context context, long downloadId) {
        Intent intent = new Intent(context, DownloadForegroundService.class);
        intent.setAction(ACTION_CANCEL);
        intent.putExtra(EXTRA_DOWNLOAD_ID, downloadId);
        context.startService(intent);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel(this);
        notificationManager = getSystemService(NotificationManager.class);
        engine = DownloadEngine.getInstance(this);
        engine.addListener(this);
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelfIfIdle();
            return START_NOT_STICKY;
        }
        String action = intent.getAction();
        if (ACTION_ENQUEUE.equals(action)) {
            promoteToForeground(getString(R.string.status_queued), 0, true);
            handleEnqueue(intent);
        } else if (ACTION_RESUME.equals(action)) {
            promoteToForeground(getString(R.string.status_downloading), 0, true);
            long id = intent.getLongExtra(EXTRA_DOWNLOAD_ID, -1L);
            if (id > 0) {
                engine.startOrResume(id);
            }
        } else if (ACTION_PAUSE.equals(action)) {
            long id = intent.getLongExtra(EXTRA_DOWNLOAD_ID, -1L);
            if (id > 0) {
                engine.pause(id);
            }
        } else if (ACTION_CANCEL.equals(action)) {
            long id = intent.getLongExtra(EXTRA_DOWNLOAD_ID, -1L);
            if (id > 0) {
                engine.cancel(id);
            }
        } else if (ACTION_PAUSE_ALL.equals(action)) {
            engine.pauseAll();
        } else if (ACTION_CANCEL_ALL.equals(action)) {
            engine.cancelAll();
        }
        return START_NOT_STICKY;
    }

    private void handleEnqueue(Intent intent) {
        String sourceUrl = intent.getStringExtra(EXTRA_SOURCE_URL);
        String mediaUrl = intent.getStringExtra(EXTRA_MEDIA_URL);
        if (sourceUrl == null || mediaUrl == null) {
            stopSelfIfIdle();
            return;
        }
        String platformId = nonNullOr(intent.getStringExtra(EXTRA_PLATFORM_ID), "generic");
        String title = nonNullOr(intent.getStringExtra(EXTRA_TITLE), "Media");
        String quality = nonNullOr(intent.getStringExtra(EXTRA_QUALITY_LABEL), "Best");
        String mime = nonNullOr(intent.getStringExtra(EXTRA_MIME_TYPE), "video/mp4");
        String thumb = intent.getStringExtra(EXTRA_THUMBNAIL_URL);
        long estBytes = intent.getLongExtra(EXTRA_ESTIMATED_BYTES, -1L);

        dbExecutor.execute(() -> {
            DownloadEntity entity = new DownloadEntity();
            entity.sourceUrl = sourceUrl;
            entity.resolvedMediaUrl = mediaUrl;
            entity.platformId = platformId;
            entity.title = title;
            entity.qualityLabel = quality;
            entity.mimeType = mime;
            entity.thumbnailUrl = thumb;
            entity.totalBytes = estBytes;
            entity.status = DownloadStatus.QUEUED;
            entity.createdAt = System.currentTimeMillis();

            long insertedId = AppDatabase.getInstance(this).downloadDao().insert(entity);
            engine.startOrResume(insertedId);
        });
    }

    private void promoteToForeground(String contentText, int progress, boolean indeterminate) {
        Notification notification = buildProgressNotification(contentText, progress, indeterminate);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private Notification buildProgressNotification(String contentText, int progress, boolean indeterminate) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPi = PendingIntent.getActivity(
                this,
                0,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent pauseAllPi = PendingIntent.getService(
                this,
                1,
                new Intent(this, DownloadForegroundService.class).setAction(ACTION_PAUSE_ALL),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent cancelAllPi = PendingIntent.getService(
                this,
                2,
                new Intent(this, DownloadForegroundService.class).setAction(ACTION_CANCEL_ALL),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int active = Math.max(1, engine != null ? engine.getActiveCount() : 1);
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_anchor_mark)
                .setContentTitle(getString(R.string.notif_downloading_title, active))
                .setContentText(contentText)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setProgress(100, progress, indeterminate)
                .setContentIntent(contentPi)
                .addAction(R.drawable.ic_pause, getString(R.string.notif_action_pause_all), pauseAllPi)
                .addAction(R.drawable.ic_close, getString(R.string.notif_action_cancel_all), cancelAllPi)
                .build();
    }

    @Override
    public void onProgressUpdate(int activeCount, @Nullable String activeTitle, int percent) {
        long now = System.currentTimeMillis();
        if (now - lastNotifyMs < 500L) {
            return;
        }
        lastNotifyMs = now;
        if (notificationManager != null) {
            String text = activeTitle != null ? activeTitle : getString(R.string.status_downloading);
            notificationManager.notify(
                    NOTIFICATION_ID,
                    buildProgressNotification(text, percent, percent <= 0)
            );
        }
    }

    @Override
    public void onDownloadCompleted(DownloadEntity entity) {
        if (notificationManager != null) {
            Intent openIntent = new Intent(this, MainActivity.class);
            openIntent.putExtra(MainActivity.EXTRA_OPEN_LIBRARY_TAB, true);
            PendingIntent pi = PendingIntent.getActivity(
                    this,
                    (int) entity.id + 100,
                    openIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            Notification done = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_check)
                    .setContentTitle("Saved to " + MediaStoreStorage.folderDisplayName(entity.mimeType))
                    .setContentText(entity.title)
                    .setAutoCancel(true)
                    .setContentIntent(pi)
                    .build();
            notificationManager.notify((int) (NOTIFICATION_ID + entity.id), done);
        }
    }

    @Override
    public void onDownloadFailed(DownloadEntity entity, String reason) {
        if (notificationManager != null) {
            Notification failed = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_close)
                    .setContentTitle("Download failed")
                    .setContentText(entity.title + " — " + reason)
                    .setAutoCancel(true)
                    .build();
            notificationManager.notify((int) (NOTIFICATION_ID + entity.id), failed);
        }
    }

    @Override
    public void onQueueDrained() {
        stopSelfIfIdle();
    }

    private void stopSelfIfIdle() {
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        if (engine != null) {
            engine.removeListener(this);
        }
        dbExecutor.shutdown();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private static String nonNullOr(@Nullable String val, String fallback) {
        return val != null && !val.isBlank() ? val : fallback;
    }
}
