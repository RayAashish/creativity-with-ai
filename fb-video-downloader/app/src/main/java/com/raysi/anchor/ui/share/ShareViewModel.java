package com.raysi.anchor.ui.share;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.raysi.anchor.data.db.AppDatabase;
import com.raysi.anchor.data.db.DownloadDao;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.extractor.ExtractorRegistry;
import com.raysi.anchor.extractor.model.ExtractionResult;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class ShareViewModel extends AndroidViewModel {

    public static final class UiState {
        public final boolean loading;
        public final ExtractionResult result;
        public final boolean isDuplicate;

        private UiState(boolean loading, ExtractionResult result, boolean isDuplicate) {
            this.loading = loading;
            this.result = result;
            this.isDuplicate = isDuplicate;
        }

        public static UiState loading() {
            return new UiState(true, null, false);
        }

        public static UiState loaded(ExtractionResult result, boolean isDuplicate) {
            return new UiState(false, result, isDuplicate);
        }
    }

    private final MutableLiveData<UiState> uiState = new MutableLiveData<>();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final DownloadDao dao;

    public ShareViewModel(@NonNull Application application) {
        super(application);
        this.dao = AppDatabase.getInstance(application).downloadDao();
    }

    @NonNull
    public LiveData<UiState> getUiState() {
        return uiState;
    }

    public void resolveUrl(@NonNull String rawSharedText) {
        uiState.setValue(UiState.loading());
        executor.execute(() -> {
            ExtractionResult result = ExtractorRegistry.getDefault().resolveAndExtract(rawSharedText, true);
            boolean duplicate = false;
            if (result instanceof ExtractionResult.Success success) {
                DownloadEntity existing = dao.findLatestBySourceUrl(success.getCanonicalUrl());
                duplicate = existing != null;
            }
            uiState.postValue(UiState.loaded(result, duplicate));
        });
    }

    @Override
    protected void onCleared() {
        executor.shutdownNow();
        super.onCleared();
    }
}
