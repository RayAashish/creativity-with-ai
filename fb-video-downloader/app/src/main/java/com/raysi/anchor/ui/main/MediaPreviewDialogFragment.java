package com.raysi.anchor.ui.main;

import android.app.Dialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.DialogFragment;
import androidx.media3.common.MediaItem;
import androidx.media3.exoplayer.ExoPlayer;

import com.bumptech.glide.Glide;
import com.raysi.anchor.R;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.databinding.DialogMediaPreviewBinding;

/**
 * Full-screen OLED preview dialog powered by Media3 ExoPlayer for videos and Glide for images.
 */
public final class MediaPreviewDialogFragment extends DialogFragment {

    public interface ActionCallback {
        void onShare(long id);

        void onOpenOriginal(String sourceUrl);

        void onDelete(long id);
    }

    private static final String ARG_ID = "arg_id";
    private static final String ARG_TITLE = "arg_title";
    private static final String ARG_MEDIA_URI = "arg_media_uri";
    private static final String ARG_SOURCE_URL = "arg_source_url";
    private static final String ARG_MIME_TYPE = "arg_mime_type";

    private DialogMediaPreviewBinding binding;
    @Nullable
    private ExoPlayer player;
    @Nullable
    private ActionCallback callback;

    @NonNull
    public static MediaPreviewDialogFragment newInstance(@NonNull DownloadEntity entity) {
        MediaPreviewDialogFragment fragment = new MediaPreviewDialogFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_ID, entity.id);
        args.putString(ARG_TITLE, entity.title);
        args.putString(ARG_MEDIA_URI, entity.mediaStoreUri);
        args.putString(ARG_SOURCE_URL, entity.sourceUrl);
        args.putString(ARG_MIME_TYPE, entity.mimeType);
        fragment.setArguments(args);
        return fragment;
    }

    public void setActionCallback(@Nullable ActionCallback callback) {
        this.callback = callback;
    }

    @Override
    public int getTheme() {
        return R.style.Theme_Anchor;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        Dialog dialog = super.onCreateDialog(savedInstanceState);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        return dialog;
    }

    @Nullable
    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater,
            @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState
    ) {
        binding = DialogMediaPreviewBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        ViewCompat.setOnApplyWindowInsetsListener(binding.previewRoot, (v, insets) -> {
            Insets sys = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            binding.previewTopBarContainer.setPadding(sys.left, sys.top, sys.right, 0);
            binding.playerView.setPadding(sys.left, 0, sys.right, sys.bottom);
            binding.ivFullImage.setPadding(sys.left, 0, sys.right, sys.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        Bundle args = requireArguments();
        long id = args.getLong(ARG_ID);
        String title = args.getString(ARG_TITLE, "");
        String mediaUri = args.getString(ARG_MEDIA_URI, "");
        String sourceUrl = args.getString(ARG_SOURCE_URL, "");
        String mimeType = args.getString(ARG_MIME_TYPE, "video/mp4");

        binding.tvPreviewTitle.setText(title);
        binding.btnPreviewClose.setOnClickListener(v -> dismissAllowingStateLoss());
        binding.btnPreviewShare.setOnClickListener(v -> {
            if (callback != null) {
                callback.onShare(id);
            }
        });
        binding.btnPreviewOpenPost.setOnClickListener(v -> {
            if (callback != null) {
                callback.onOpenOriginal(sourceUrl);
            }
        });
        binding.btnPreviewDelete.setOnClickListener(v -> {
            if (callback != null) {
                callback.onDelete(id);
            }
            dismissAllowingStateLoss();
        });

        boolean isImage = mimeType.startsWith("image/");
        boolean isPlayable = mimeType.startsWith("video/") || mimeType.startsWith("audio/");
        if (isImage) {
            binding.playerView.setVisibility(View.GONE);
            binding.groupFilePreview.setVisibility(View.GONE);
            binding.ivFullImage.setVisibility(View.VISIBLE);
            if (!mediaUri.isBlank()) {
                Glide.with(binding.ivFullImage)
                        .load(Uri.parse(mediaUri))
                        .into(binding.ivFullImage);
            }
        } else if (isPlayable) {
            binding.ivFullImage.setVisibility(View.GONE);
            binding.groupFilePreview.setVisibility(View.GONE);
            binding.playerView.setVisibility(View.VISIBLE);
            if (mimeType.startsWith("audio/")) {
                binding.playerView.setControllerShowTimeoutMs(0);
                binding.playerView.showController();
            }
            if (!mediaUri.isBlank()) {
                player = new ExoPlayer.Builder(requireContext()).build();
                binding.playerView.setPlayer(player);
                player.setMediaItem(MediaItem.fromUri(Uri.parse(mediaUri)));
                player.prepare();
                player.play();
            }
        } else {
            binding.ivFullImage.setVisibility(View.GONE);
            binding.playerView.setVisibility(View.GONE);
            binding.groupFilePreview.setVisibility(View.VISIBLE);
            binding.tvFileMime.setText(mimeType);
            binding.btnOpenExternalFile.setOnClickListener(v -> {
                if (!mediaUri.isBlank()) {
                    Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                    viewIntent.setDataAndType(Uri.parse(mediaUri), mimeType);
                    viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    try {
                        startActivity(Intent.createChooser(viewIntent, title));
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(requireContext(), "No app available to open this file type", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        Dialog dialog = getDialog();
        if (dialog != null && dialog.getWindow() != null) {
            dialog.getWindow().setLayout(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
            );
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (player != null) {
            player.pause();
        }
    }

    @Override
    public void onDestroyView() {
        if (player != null) {
            binding.playerView.setPlayer(null);
            player.release();
            player = null;
        }
        binding = null;
        super.onDestroyView();
    }
}
