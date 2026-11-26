package com.raysi.anchor.downloader;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.io.File;
import java.io.IOException;
import java.util.Locale;

/**
 * Zero-copy MediaStore writer managing pending entries (IS_PENDING = 1) directly in
 * Movies/Anchor (video), Pictures/Anchor (image), Music/Anchor (audio), and Download/Anchor (other).
 */
public final class MediaStoreStorage {

    private static final String FOLDER_NAME = "Anchor";

    private MediaStoreStorage() {
    }

    public enum Bucket {
        VIDEO,
        IMAGE,
        AUDIO,
        DOWNLOAD
    }

    @NonNull
    public static Bucket bucketForMime(@NonNull String mimeType) {
        String lower = mimeType.toLowerCase(Locale.ROOT);
        if (lower.startsWith("image/")) {
            return Bucket.IMAGE;
        }
        if (lower.startsWith("video/")) {
            return Bucket.VIDEO;
        }
        if (lower.startsWith("audio/")) {
            return Bucket.AUDIO;
        }
        return Bucket.DOWNLOAD;
    }

    @NonNull
    public static String folderDisplayName(@NonNull String mimeType) {
        return switch (bucketForMime(mimeType)) {
            case IMAGE -> "Pictures/" + FOLDER_NAME;
            case VIDEO -> "Movies/" + FOLDER_NAME;
            case AUDIO -> "Music/" + FOLDER_NAME;
            case DOWNLOAD -> "Download/" + FOLDER_NAME;
        };
    }

    @NonNull
    public static Uri createPendingEntry(
            @NonNull Context context,
            @NonNull String title,
            @NonNull String mimeType
    ) throws IOException {
        Bucket bucket = bucketForMime(mimeType);
        String fileName = buildDisplayName(title, mimeType);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentResolver resolver = context.getContentResolver();
            Uri collection = switch (bucket) {
                case IMAGE -> MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                case VIDEO -> MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                case AUDIO -> MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                case DOWNLOAD -> MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
            };
            String baseDir = switch (bucket) {
                case IMAGE -> Environment.DIRECTORY_PICTURES;
                case VIDEO -> Environment.DIRECTORY_MOVIES;
                case AUDIO -> Environment.DIRECTORY_MUSIC;
                case DOWNLOAD -> Environment.DIRECTORY_DOWNLOADS;
            };

            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, baseDir + "/" + FOLDER_NAME);
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);

            Uri created = resolver.insert(collection, values);
            if (created == null) {
                throw new IOException("Failed to insert MediaStore entry.");
            }
            return created;
        }

        String dirType = switch (bucket) {
            case IMAGE -> Environment.DIRECTORY_PICTURES;
            case VIDEO -> Environment.DIRECTORY_MOVIES;
            case AUDIO -> Environment.DIRECTORY_MUSIC;
            case DOWNLOAD -> Environment.DIRECTORY_DOWNLOADS;
        };
        File baseDir = Environment.getExternalStoragePublicDirectory(dirType);
        File appDir = new File(baseDir, FOLDER_NAME);
        if (!appDir.exists() && !appDir.mkdirs()) {
            throw new IOException("Failed to create media output directory.");
        }
        File target = new File(appDir, fileName);
        if (!target.exists() && !target.createNewFile()) {
            throw new IOException("Failed to create target media file.");
        }
        return Uri.fromFile(target);
    }

    @NonNull
    public static ParcelFileDescriptor openReadWrite(
            @NonNull Context context,
            @NonNull Uri uri
    ) throws IOException {
        ContentResolver resolver = context.getContentResolver();
        ParcelFileDescriptor pfd = resolver.openFileDescriptor(uri, "rw");
        if (pfd == null) {
            throw new IOException("Unable to open MediaStore file descriptor for " + uri);
        }
        return pfd;
    }

    public static void markCompleted(
            @NonNull Context context,
            @Nullable String uriString,
            @NonNull String mimeType
    ) {
        if (uriString == null || uriString.isBlank()) {
            return;
        }
        Uri uri = Uri.parse(uriString);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && "content".equals(uri.getScheme())) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.IS_PENDING, 0);
            try {
                context.getContentResolver().update(uri, values, null, null);
            } catch (Exception ignored) {
            }
        } else if ("file".equals(uri.getScheme()) && uri.getPath() != null) {
            MediaScannerConnection.scanFile(context, new String[]{uri.getPath()}, new String[]{mimeType}, null);
        }
    }

    public static void deleteEntry(@NonNull Context context, @Nullable String uriString) {
        if (uriString == null || uriString.isBlank()) {
            return;
        }
        Uri uri = Uri.parse(uriString);
        try {
            if ("content".equals(uri.getScheme())) {
                context.getContentResolver().delete(uri, null, null);
            } else if ("file".equals(uri.getScheme()) && uri.getPath() != null) {
                File f = new File(uri.getPath());
                if (f.exists()) {
                    //noinspection ResultOfMethodCallIgnored
                    f.delete();
                }
            }
        } catch (Exception ignored) {
        }
    }

    @NonNull
    public static String buildDisplayName(@NonNull String rawTitle, @NonNull String mimeType) {
        String sanitized = rawTitle
                .replaceAll("[\\\\/:*?\"<>|\\r\\n\\t]+", "_")
                .replaceAll("\\s+", " ")
                .trim();
        if (sanitized.isEmpty()) {
            sanitized = "Anchor_Media";
        }
        if (sanitized.length() > 48) {
            sanitized = sanitized.substring(0, 48).trim();
        }
        String suffix = "_" + (System.currentTimeMillis() % 1_000_000L);
        return sanitized + suffix + extensionForMime(mimeType);
    }

    @NonNull
    public static String extensionForMime(@NonNull String mimeType) {
        String lower = mimeType.toLowerCase(Locale.ROOT);
        if (lower.contains("png")) {
            return ".png";
        }
        if (lower.contains("webp")) {
            return ".webp";
        }
        if (lower.contains("gif")) {
            return ".gif";
        }
        if (lower.contains("avif")) {
            return ".avif";
        }
        if (lower.startsWith("image/")) {
            return ".jpg";
        }
        if (lower.contains("mpeg") || lower.contains("mp3")) {
            return ".mp3";
        }
        if (lower.contains("mp4a") || lower.contains("aac") || lower.equals("audio/mp4") || lower.equals("audio/x-m4a")) {
            return ".m4a";
        }
        if (lower.contains("ogg") || lower.contains("opus")) {
            return ".ogg";
        }
        if (lower.contains("flac")) {
            return ".flac";
        }
        if (lower.contains("wav")) {
            return ".wav";
        }
        if (lower.startsWith("audio/")) {
            return ".m4a";
        }
        if (lower.contains("webm")) {
            return ".webm";
        }
        if (lower.contains("matroska")) {
            return ".mkv";
        }
        if (lower.contains("quicktime")) {
            return ".mov";
        }
        if (lower.startsWith("video/")) {
            return ".mp4";
        }
        if (lower.contains("pdf")) {
            return ".pdf";
        }
        if (lower.contains("zip")) {
            return ".zip";
        }
        if (lower.contains("text/plain")) {
            return ".txt";
        }
        return ".bin";
    }
}
