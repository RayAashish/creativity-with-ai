package com.raysi.anchor.data;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

public final class AnchorPreferences {

    private static final String PREFS_NAME = "anchor_prefs";
    private static final String KEY_AUTO_DOWNLOAD = "auto_download_best";

    private final SharedPreferences prefs;

    public AnchorPreferences(@NonNull Context context) {
        this.prefs = context.getApplicationContext()
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public boolean isAutoDownloadEnabled() {
        return prefs.getBoolean(KEY_AUTO_DOWNLOAD, false);
    }

    public void setAutoDownloadEnabled(boolean enabled) {
        prefs.edit().putBoolean(KEY_AUTO_DOWNLOAD, enabled).apply();
    }
}
