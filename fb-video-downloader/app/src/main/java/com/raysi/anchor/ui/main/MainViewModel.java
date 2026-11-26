package com.raysi.anchor.ui.main;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Transformations;

import com.raysi.anchor.data.db.AppDatabase;
import com.raysi.anchor.data.db.DownloadDao;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.downloader.MediaStoreStorage;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainViewModel extends AndroidViewModel {

    public static final String FILTER_ALL = "all";
    public static final String FILTER_OTHER = "other";

    private final DownloadDao dao;
    private final MutableLiveData<String> platformFilter = new MutableLiveData<>(FILTER_ALL);
    private final LiveData<List<DownloadEntity>> queueItems;
    private final LiveData<List<DownloadEntity>> libraryItems;
    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();

    public MainViewModel(@NonNull Application application) {
        super(application);
        this.dao = AppDatabase.getInstance(application).downloadDao();
        this.queueItems = dao.observeQueue();
        this.libraryItems = Transformations.switchMap(platformFilter, filter -> {
            if (FILTER_ALL.equals(filter)) {
                return dao.observeCompleted();
            }
            if (FILTER_OTHER.equals(filter)) {
                return dao.observeCompletedOther();
            }
            return dao.observeCompletedByPlatform(filter);
        });
    }

    @NonNull
    public LiveData<List<DownloadEntity>> getQueueItems() {
        return queueItems;
    }

    @NonNull
    public LiveData<List<DownloadEntity>> getLibraryItems() {
        return libraryItems;
    }

    public void setPlatformFilter(@NonNull String filter) {
        if (!filter.equals(platformFilter.getValue())) {
            platformFilter.setValue(filter);
        }
    }

    public void deleteLibraryItem(@NonNull DownloadEntity entity) {
        ioExecutor.execute(() -> {
            MediaStoreStorage.deleteEntry(getApplication(), entity.mediaStoreUri);
            dao.deleteById(entity.id);
        });
    }

    @Override
    protected void onCleared() {
        ioExecutor.shutdownNow();
        super.onCleared();
    }
}
