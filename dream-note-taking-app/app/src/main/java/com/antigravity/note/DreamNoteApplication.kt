package com.antigravity.note

import android.app.Application
import android.os.SystemClock
import android.util.Log

class DreamNoteApplication : Application() {
    companion object {
        private const val TAG = "DreamNoteApp"
        var appStartTimeNanos: Long = 0L
            private set
    }

    override fun onCreate() {
        appStartTimeNanos = SystemClock.elapsedRealtimeNanos()
        super.onCreate()
        Log.i(TAG, "DreamNoteApplication initialized at $appStartTimeNanos")
    }
}
