package com.raysi.anchor.downloader;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Throttled in-memory bus broadcasting live per-download byte offsets and EWMA transfer speed (bytes/s).
 */
public final class TransferSpeedBus {

    public static final class TransferSnapshot {
        public final long downloadedBytes;
        public final long totalBytes;
        public final long bytesPerSecond;

        public TransferSnapshot(long downloadedBytes, long totalBytes, long bytesPerSecond) {
            this.downloadedBytes = downloadedBytes;
            this.totalBytes = totalBytes;
            this.bytesPerSecond = bytesPerSecond;
        }
    }

    private static volatile TransferSpeedBus instance;

    private final ConcurrentHashMap<Long, TransferSnapshot> snapshots = new ConcurrentHashMap<>();
    private final MutableLiveData<Map<Long, TransferSnapshot>> liveData =
            new MutableLiveData<>(Collections.emptyMap());
    private volatile long lastDispatchMs = 0L;

    private TransferSpeedBus() {
    }

    @NonNull
    public static TransferSpeedBus getInstance() {
        TransferSpeedBus local = instance;
        if (local == null) {
            synchronized (TransferSpeedBus.class) {
                local = instance;
                if (local == null) {
                    local = new TransferSpeedBus();
                    instance = local;
                }
            }
        }
        return local;
    }

    public void publish(long downloadId, long downloadedBytes, long totalBytes, long bytesPerSecond, boolean force) {
        snapshots.put(downloadId, new TransferSnapshot(downloadedBytes, totalBytes, bytesPerSecond));
        long now = System.currentTimeMillis();
        if (force || now - lastDispatchMs >= 250L) {
            lastDispatchMs = now;
            liveData.postValue(new HashMap<>(snapshots));
        }
    }

    public void clear(long downloadId) {
        snapshots.remove(downloadId);
        liveData.postValue(new HashMap<>(snapshots));
    }

    @Nullable
    public TransferSnapshot getSnapshot(long downloadId) {
        return snapshots.get(downloadId);
    }

    @NonNull
    public LiveData<Map<Long, TransferSnapshot>> observeSnapshots() {
        return liveData;
    }
}
