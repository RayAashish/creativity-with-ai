package com.raysi.anchor.ui.share;

import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.lifecycle.ViewModelProvider;
import androidx.transition.TransitionManager;

import com.bumptech.glide.Glide;
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipDrawable;
import com.raysi.anchor.R;
import com.raysi.anchor.data.AnchorPreferences;
import com.raysi.anchor.databinding.FragmentShareSheetBinding;
import com.raysi.anchor.downloader.DownloadForegroundService;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.util.FormatUtils;
import com.raysi.anchor.util.PlatformIconHelper;

import java.util.List;

/**
 * Translucent OLED dark BottomSheet overlay for instant share-sheet media resolution,
 * quality selection, and optional auto-download.
 */
public final class ShareBottomSheetDialogFragment extends BottomSheetDialogFragment {

    public interface DismissCallback {
        void onSheetDismissed();
    }

    private static final String ARG_SHARED_TEXT = "arg_shared_text";
    private static final String ARG_AUTO_DISMISS_HOST = "arg_auto_dismiss_host";

    private FragmentShareSheetBinding binding;
    private ShareViewModel viewModel;
    private AnchorPreferences prefs;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private String rawInput = "";
    private ExtractionResult.Success currentSuccess;
    private MediaVariant selectedVariant;
    private boolean autoTriggeredForCurrentResult = false;
    @Nullable
    private DismissCallback dismissCallback;

    @NonNull
    public static ShareBottomSheetDialogFragment newInstance(
            @NonNull String sharedText,
            boolean finishHostOnDismiss
    ) {
        ShareBottomSheetDialogFragment fragment = new ShareBottomSheetDialogFragment();
        Bundle args = new Bundle();
        args.putString(ARG_SHARED_TEXT, sharedText);
        args.putBoolean(ARG_AUTO_DISMISS_HOST, finishHostOnDismiss);
        fragment.setArguments(args);
        return fragment;
    }

    public void setDismissCallback(@Nullable DismissCallback callback) {
        this.dismissCallback = callback;
    }

    public void updateSharedInput(@NonNull String newSharedText) {
        this.rawInput = newSharedText;
        this.autoTriggeredForCurrentResult = false;
        this.currentSuccess = null;
        this.selectedVariant = null;
        if (binding != null && viewModel != null) {
            binding.tvLoadingUrl.setText(newSharedText);
            showLoadingState();
            viewModel.resolveUrl(newSharedText);
        }
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        BottomSheetDialog dialog = (BottomSheetDialog) super.onCreateDialog(savedInstanceState);
        dialog.setOnShowListener(d -> {
            FrameLayout bottomSheet = dialog.findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (bottomSheet != null) {
                bottomSheet.setBackgroundResource(android.R.color.transparent);
                BottomSheetBehavior<FrameLayout> behavior = BottomSheetBehavior.from(bottomSheet);
                behavior.setSkipCollapsed(true);
                behavior.setState(BottomSheetBehavior.STATE_EXPANDED);
                behavior.setMaxWidth(getResources().getDimensionPixelSize(R.dimen.sheet_max_width));
            }
        });
        return dialog;
    }

    @Nullable
    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater,
            @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState
    ) {
        binding = FragmentShareSheetBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        prefs = new AnchorPreferences(requireContext());
        viewModel = new ViewModelProvider(this).get(ShareViewModel.class);

        final int baseBottomPad = binding.sheetRoot.getPaddingBottom();
        ViewCompat.setOnApplyWindowInsetsListener(binding.sheetScroll, (v, insets) -> {
            Insets nav = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            binding.sheetRoot.setPadding(
                    binding.sheetRoot.getPaddingLeft(),
                    binding.sheetRoot.getPaddingTop(),
                    binding.sheetRoot.getPaddingRight(),
                    baseBottomPad + nav.bottom
            );
            return insets;
        });

        if (getArguments() != null) {
            rawInput = getArguments().getString(ARG_SHARED_TEXT, "");
        }

        binding.tvLoadingUrl.setText(rawInput);
        binding.switchAutoDownload.setChecked(prefs.isAutoDownloadEnabled());
        binding.switchAutoDownload.setOnCheckedChangeListener((btn, checked) ->
                prefs.setAutoDownloadEnabled(checked));

        binding.btnSheetClose.setOnClickListener(v -> dismissAllowingStateLoss());
        binding.btnErrorDismiss.setOnClickListener(v -> dismissAllowingStateLoss());
        binding.btnErrorRetry.setOnClickListener(v -> {
            showLoadingState();
            viewModel.resolveUrl(rawInput);
        });
        binding.btnSheetDownload.setOnClickListener(v -> startSelectedDownload());

        viewModel.getUiState().observe(getViewLifecycleOwner(), this::renderState);
        if (savedInstanceState == null && !rawInput.isBlank()) {
            showLoadingState();
            viewModel.resolveUrl(rawInput);
        }
    }

    private void renderState(@NonNull ShareViewModel.UiState state) {
        if (binding == null) {
            return;
        }
        if (state.loading) {
            showLoadingState();
            return;
        }
        if (state.result instanceof ExtractionResult.Success success) {
            currentSuccess = success;
            binding.ivSheetPlatform.setImageResource(success.getBadgeIconRes());
            binding.tvSheetPlatform.setText(success.getPlatformDisplayName());

            if (prefs.isAutoDownloadEnabled() && !autoTriggeredForCurrentResult) {
                autoTriggeredForCurrentResult = true;
                selectedVariant = success.getBestVariant();
                enqueueVariant(success, selectedVariant);
                showAutoConfirmedState(success);
                mainHandler.postDelayed(() -> {
                    if (isAdded()) {
                        dismissAllowingStateLoss();
                    }
                }, 900L);
                return;
            }
            showPreviewState(success, state.isDuplicate);
        } else if (state.result instanceof ExtractionResult.Failure failure) {
            showErrorState(failure.getMessage());
        }
    }

    private void showLoadingState() {
        TransitionManager.beginDelayedTransition(binding.sheetRoot);
        binding.ivSheetPlatform.setImageResource(R.drawable.ic_platform_generic);
        binding.tvSheetPlatform.setText(R.string.app_name);
        binding.groupLoading.setVisibility(View.VISIBLE);
        binding.groupPreview.setVisibility(View.GONE);
        binding.groupAutoConfirmed.setVisibility(View.GONE);
        binding.groupError.setVisibility(View.GONE);
    }

    private void showPreviewState(ExtractionResult.Success success, boolean isDuplicate) {
        TransitionManager.beginDelayedTransition(binding.sheetRoot);
        binding.groupLoading.setVisibility(View.GONE);
        binding.groupAutoConfirmed.setVisibility(View.GONE);
        binding.groupError.setVisibility(View.GONE);
        binding.groupPreview.setVisibility(View.VISIBLE);

        binding.tvSheetTitle.setText(success.getTitle());
        if (success.getAuthor() != null && !success.getAuthor().isBlank()) {
            binding.tvSheetAuthor.setVisibility(View.VISIBLE);
            binding.tvSheetAuthor.setText(success.getAuthor());
        } else {
            binding.tvSheetAuthor.setVisibility(View.GONE);
        }

        binding.tvDuplicateNotice.setVisibility(isDuplicate ? View.VISIBLE : View.GONE);

        if (success.getThumbnailUrl() != null && !success.getThumbnailUrl().isBlank()) {
            binding.ivSheetThumb.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
            Glide.with(binding.ivSheetThumb)
                    .load(success.getThumbnailUrl())
                    .centerCrop()
                    .placeholder(R.drawable.bg_card_outline)
                    .into(binding.ivSheetThumb);
        } else {
            binding.ivSheetThumb.setScaleType(android.widget.ImageView.ScaleType.CENTER_INSIDE);
            binding.ivSheetThumb.setImageResource(
                    PlatformIconHelper.iconForMimeType(success.getBestVariant().getMimeType())
            );
        }

        populateQualityChips(success.getVariants());
    }

    private void populateQualityChips(List<MediaVariant> variants) {
        binding.chipGroupQualities.removeAllViews();
        if (variants.isEmpty()) {
            return;
        }
        selectedVariant = variants.get(0);
        for (int i = 0; i < variants.size(); i++) {
            MediaVariant variant = variants.get(i);
            Chip chip = new Chip(requireContext());
            ChipDrawable chipDrawable = ChipDrawable.createFromAttributes(
                    requireContext(),
                    null,
                    0,
                    R.style.Widget_Anchor_FilterChip
            );
            chip.setChipDrawable(chipDrawable);
            chip.setCheckable(true);
            chip.setId(View.generateViewId());

            String label = variant.getEstimatedBytes() > 0
                    ? variant.getLabel() + " • " + FormatUtils.formatBytes(variant.getEstimatedBytes())
                    : variant.getLabel();
            chip.setText(label);
            chip.setTag(variant);
            binding.chipGroupQualities.addView(chip);
            if (i == 0) {
                chip.setChecked(true);
            }
        }

        binding.chipGroupQualities.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (!checkedIds.isEmpty()) {
                View checked = group.findViewById(checkedIds.get(0));
                if (checked != null && checked.getTag() instanceof MediaVariant v) {
                    selectedVariant = v;
                }
            }
        });
    }

    private void showAutoConfirmedState(ExtractionResult.Success success) {
        TransitionManager.beginDelayedTransition(binding.sheetRoot);
        binding.groupLoading.setVisibility(View.GONE);
        binding.groupPreview.setVisibility(View.GONE);
        binding.groupError.setVisibility(View.GONE);
        binding.groupAutoConfirmed.setVisibility(View.VISIBLE);
        binding.tvAutoConfirmMsg.setText(
                "Anchoring best quality from " + success.getPlatformDisplayName() + "…"
        );
    }

    private void showErrorState(String message) {
        TransitionManager.beginDelayedTransition(binding.sheetRoot);
        binding.groupLoading.setVisibility(View.GONE);
        binding.groupPreview.setVisibility(View.GONE);
        binding.groupAutoConfirmed.setVisibility(View.GONE);
        binding.groupError.setVisibility(View.VISIBLE);
        binding.tvErrorMessage.setText(message);
    }

    private void startSelectedDownload() {
        if (currentSuccess == null || selectedVariant == null) {
            return;
        }
        enqueueVariant(currentSuccess, selectedVariant);
        dismissAllowingStateLoss();
    }

    private void enqueueVariant(ExtractionResult.Success success, MediaVariant variant) {
        DownloadForegroundService.enqueueDownload(
                requireContext(),
                success.getCanonicalUrl(),
                variant.getUrl(),
                success.getPlatformId(),
                success.getTitle(),
                variant.getLabel(),
                variant.getMimeType(),
                success.getThumbnailUrl(),
                variant.getEstimatedBytes()
        );
    }

    @Override
    public void onDismiss(@NonNull DialogInterface dialog) {
        super.onDismiss(dialog);
        if (dismissCallback != null) {
            dismissCallback.onSheetDismissed();
        }
    }

    @Override
    public void onDestroyView() {
        mainHandler.removeCallbacksAndMessages(null);
        binding = null;
        super.onDestroyView();
    }
}
