package com.raysi.anchor.ui.main;

import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.raysi.anchor.R;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.databinding.ItemLibraryMediaBinding;
import com.raysi.anchor.util.FormatUtils;
import com.raysi.anchor.util.PlatformIconHelper;

import java.util.Objects;

public final class LibraryAdapter extends ListAdapter<DownloadEntity, LibraryAdapter.LibraryViewHolder> {

    public interface ItemListener {
        void onItemClick(DownloadEntity entity);

        void onMoreClick(DownloadEntity entity, View anchor);
    }

    private final ItemListener listener;

    public LibraryAdapter(@NonNull ItemListener listener) {
        super(DIFF_CALLBACK);
        this.listener = listener;
    }

    @NonNull
    @Override
    public LibraryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemLibraryMediaBinding binding = ItemLibraryMediaBinding.inflate(
                LayoutInflater.from(parent.getContext()),
                parent,
                false
        );
        return new LibraryViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull LibraryViewHolder holder, int position) {
        holder.bind(getItem(position), listener);
    }

    static final class LibraryViewHolder extends RecyclerView.ViewHolder {

        private final ItemLibraryMediaBinding binding;

        LibraryViewHolder(ItemLibraryMediaBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(DownloadEntity item, ItemListener listener) {
            binding.tvLibTitle.setText(item.title);
            String meta = FormatUtils.platformDisplayName(item.platformId)
                    + (item.totalBytes > 0 ? " • " + FormatUtils.formatBytes(item.totalBytes) : "");
            binding.tvLibMeta.setText(meta);

            binding.ivBadgePlatform.setImageResource(PlatformIconHelper.iconForPlatform(item.platformId));
            binding.tvBadgeQuality.setText(item.qualityLabel);

            boolean isVisualMedia = item.mimeType.startsWith("image/") || item.mimeType.startsWith("video/");
            binding.ivMediaKind.setImageResource(PlatformIconHelper.iconForMimeType(item.mimeType));

            Object imageModel = isVisualMedia
                    ? ((item.mediaStoreUri != null && !item.mediaStoreUri.isBlank())
                            ? Uri.parse(item.mediaStoreUri)
                            : item.thumbnailUrl)
                    : item.thumbnailUrl;

            if (imageModel != null) {
                binding.ivMediaThumb.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
                Glide.with(binding.ivMediaThumb)
                        .load(imageModel)
                        .centerCrop()
                        .placeholder(R.drawable.bg_card_outline)
                        .into(binding.ivMediaThumb);
            } else {
                binding.ivMediaThumb.setScaleType(android.widget.ImageView.ScaleType.CENTER_INSIDE);
                binding.ivMediaThumb.setImageResource(PlatformIconHelper.iconForMimeType(item.mimeType));
            }

            binding.getRoot().setOnClickListener(v -> listener.onItemClick(item));
            binding.btnLibMore.setOnClickListener(v -> listener.onMoreClick(item, v));
        }
    }

    private static final DiffUtil.ItemCallback<DownloadEntity> DIFF_CALLBACK =
            new DiffUtil.ItemCallback<>() {
                @Override
                public boolean areItemsTheSame(@NonNull DownloadEntity oldItem, @NonNull DownloadEntity newItem) {
                    return oldItem.id == newItem.id;
                }

                @Override
                public boolean areContentsTheSame(@NonNull DownloadEntity oldItem, @NonNull DownloadEntity newItem) {
                    return Objects.equals(oldItem.title, newItem.title)
                            && Objects.equals(oldItem.mediaStoreUri, newItem.mediaStoreUri)
                            && oldItem.totalBytes == newItem.totalBytes
                            && Objects.equals(oldItem.qualityLabel, newItem.qualityLabel);
                }
            };
}
