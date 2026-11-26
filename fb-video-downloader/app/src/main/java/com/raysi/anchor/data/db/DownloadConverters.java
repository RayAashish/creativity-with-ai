package com.raysi.anchor.data.db;

import androidx.annotation.NonNull;
import androidx.room.TypeConverter;

public final class DownloadConverters {

    @TypeConverter
    @NonNull
    public static String fromStatus(@NonNull DownloadStatus status) {
        return status.name();
    }

    @TypeConverter
    @NonNull
    public static DownloadStatus toStatus(@NonNull String value) {
        return DownloadStatus.valueOf(value);
    }
}
