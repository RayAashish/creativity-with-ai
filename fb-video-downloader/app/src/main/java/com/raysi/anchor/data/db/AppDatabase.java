package com.raysi.anchor.data.db;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;

@Database(entities = {DownloadEntity.class}, version = 1, exportSchema = true)
@TypeConverters({DownloadConverters.class})
public abstract class AppDatabase extends RoomDatabase {

    private static volatile AppDatabase instance;

    public abstract DownloadDao downloadDao();

    @NonNull
    public static AppDatabase getInstance(@NonNull Context context) {
        AppDatabase local = instance;
        if (local == null) {
            synchronized (AppDatabase.class) {
                local = instance;
                if (local == null) {
                    local = Room.databaseBuilder(
                                    context.getApplicationContext(),
                                    AppDatabase.class,
                                    "anchor.db"
                            )
                            .setJournalMode(JournalMode.WRITE_AHEAD_LOGGING)
                            .build();
                    instance = local;
                }
            }
        }
        return local;
    }
}
