package com.raysi.anchor;

import android.app.Application;

import androidx.appcompat.app.AppCompatDelegate;

import com.raysi.anchor.downloader.DownloadEngine;
import com.raysi.anchor.downloader.DownloadForegroundService;

public final class AnchorApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        DownloadForegroundService.ensureChannel(this);
        DownloadEngine.getInstance(this).reconcileInterruptedOnStartup();
    }
}
