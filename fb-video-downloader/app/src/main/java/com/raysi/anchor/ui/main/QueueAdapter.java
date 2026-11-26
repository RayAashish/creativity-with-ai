package com.raysi.anchor.ui.main;

import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.raysi.anchor.R;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.data.db.DownloadStatus;
import com.raysi.anchor.databinding.ItemQueueDownloadBinding;
import com.raysi.anchor.downloader.ByteRangeMath;
import com.raysi.anchor.downloader.TransferSpeedBus;
import com.raysi.anchor.util.FormatUtils;
import com.raysi.anchor.util.PlatformIconHelper;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

public final class QueueAdapter extends ListAdapter<DownloadEntity, QueueAdapter.QueueViewHolder> {

    public interface ActionListener {
        void onPause(DownloadEntity entity);

        void onResume(DownloadEntity entity);

        void onCancel(DownloadEntity entity);
    }

    private static final Object PAYLOAD_PROGRESS = new Object();

    private final ActionListener listener;
    private Map<Long, TransferSpeedBus.TransferSnapshot> speedSnapshots = Collections.emptyMap();

    public QueueAdapter(@NonNull ActionListener listener) {
        super(DIFF_CALLBACK);
        this.listener = listener;
    }

    public void updateSpeedSnapshots(@NonNull Map<Long, TransferSpeedBus.TransferSnapshot> snapshots) {
        this.speedSnapshots = snapshots;
        notifyItemRangeChanged(0, getItemCount(), PAYLOAD_PROGRESS);
    }

    @NonNull
    @Override
    public QueueViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemQueueDownloadBinding binding = ItemQueueDownloadBinding.inflate(
                LayoutInflater.from(parent.getContext()),
                parent,
                false
        );
        return new QueueViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull QueueViewHolder holder, int position) {
        holder.bindFull(getItem(position), speedSnapshots.get(getItem(position).id), listener);
    }

    @Override
    public void onBindViewHolder(@NonNull QueueViewHolder holder, int position, @NonNull java.util.List<Object> payloads) {
        if (!payloads.isEmpty() && payloads.contains(PAYLOAD_PROGRESS)) {
            DownloadEntity item = getItem(position);
            holder.bindProgress(item, speedSnapshots.get(item.id));
            return;
        }
        onBindViewHolder(holder, position);
    }

    static final class QueueViewHolder extends RecyclerView.ViewHolder {

        private final ItemQueueDownloadBinding binding;
        private String loadedThumbUrl;

        QueueViewHolder(ItemQueueDownloadBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bindFull(
                DownloadEntity item,
                @Nullable TransferSpeedBus.TransferSnapshot snapshot,
                ActionListener listener
        ) {
            binding.tvTitle.setText(item.title);
            binding.ivPlatform.setImageResource(PlatformIconHelper.iconForPlatform(item.platformId));
            String badgeText = FormatUtils.platformDisplayName(item.platformId) + " • " + item.qualityLabel;
            binding.tvPlatformQuality.setText(badgeText);

            if (!Objects.equals(loadedThumbUrl, item.thumbnailUrl)) {
                loadedThumbUrl = item.thumbnailUrl;
                if (item.thumbnailUrl != null && !item.thumbnailUrl.isBlank()) {
                    Glide.with(binding.ivThumb)
                            .load(item.thumbnailUrl)
                            .centerCrop()
                            .placeholder(R.drawable.bg_card_outline)
                            .into(binding.ivThumb);
                } else {
                    binding.ivThumb.setScaleType(android.widget.ImageView.ScaleType.CENTER_INSIDE);
                    binding.ivThumb.setImageResource(PlatformIconHelper.iconForMimeType(item.mimeType));
                }
            }

            bindStatusAndButtons(item, listener);
            bindProgress(item, snapshot);
        }

        private void bindStatusAndButtons(DownloadEntity item, ActionListener listener) {
            var ctx = binding.getRoot().getContext();
            switch (item.status) {
                case DOWNLOADING, QUEUED -> {
                    binding.tvStatus.setText(
                            item.status == DownloadStatus.QUEUED
                                    ? ctx.getString(R.string.status_queued)
                                    : ctx.getString(R.string.status_downloading)
                    );
                    binding.tvStatus.setTextColor(ContextCompat.getColor(ctx, R.color.accent_emerald));
                    binding.btnPauseResume.setImageResource(R.drawable.ic_pause);
                    binding.btnPauseResume.setContentDescription(ctx.getString(R.string.action_pause));
                    binding.btnPauseResume.setOnClickListener(v -> listener.onPause(item));
                }
                case PAUSED -> {
                    binding.tvStatus.setText(ctx.getString(R.string.status_paused));
                    binding.tvStatus.setTextColor(ContextCompat.getColor(ctx, R.color.text_secondary));
                    binding.btnPauseResume.setImageResource(R.drawable.ic_play);
                    binding.btnPauseResume.setContentDescription(ctx.getString(R.string.action_resume));
                    binding.btnPauseResume.setOnClickListener(v -> listener.onResume(item));
                }
                case FAILED -> {
                    binding.tvStatus.setText(
                            item.errorMessage != null && !item.errorMessage.isBlank()
                                    ? item.errorMessage
                                    : ctx.getString(R.string.status_failed)
                    );
                    binding.tvStatus.setTextColor(ContextCompat.getColor(ctx, R.color.status_error));
                    binding.btnPauseResume.setImageResource(R.drawable.ic_refresh);
                    binding.btnPauseResume.setContentDescription(ctx.getString(R.string.action_retry));
                    binding.btnPauseResume.setOnClickListener(v -> listener.onResume(item));
                }
                default -> {
                }
            }
            binding.btnCancel.setOnClickListener(v -> listener.onCancel(item));
        }

        void bindProgress(DownloadEntity item, @Nullable TransferSpeedBus.TransferSnapshot snapshot) {
            long downloaded = snapshot != null && item.status == DownloadStatus.DOWNLOADING
                    ? Math.max(item.downloadedBytes, snapshot.downloadedBytes)
                    : item.downloadedBytes;
            long total = snapshot != null && snapshot.totalBytes > 0
                    ? snapshot.totalBytes
                    : item.totalBytes;

            if (total <= 0 && item.status == DownloadStatus.DOWNLOADING) {
                binding.progressBar.setIndeterminate(true);
                binding.tvPercent.setText("--");
            } else {
                binding.progressBar.setIndeterminate(false);
                int pct = ByteRangeMath.computePercent(downloaded, total);
                binding.progressBar.setProgressCompat(pct, true);
                binding.tvPercent.setText(pct + "%");
            }

            StringBuilder meta = new StringBuilder();
            meta.append(FormatUtils.formatBytes(downloaded));
            if (total > 0) {
                meta.append(" / ").append(FormatUtils.formatBytes(total));
            }
            if (snapshot != null && snapshot.bytesPerSecond > 0 && item.status == DownloadStatus.DOWNLOADING) {
                meta.append("  •  ").append(FormatUtils.formatSpeed(snapshot.bytesPerSecond));
            }
            binding.tvTransferMeta.setText(meta.toString());
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
                    return oldItem.status == newItem.status
                            && oldItem.downloadedBytes == newItem.downloadedBytes
                            && oldItem.totalBytes == newItem.totalBytes
                            && Objects.equals(oldItem.errorMessage, newItem.errorMessage)
                            && Objects.equals(oldItem.title, newItem.title)
                            && Objects.equals(oldItem.thumbnailUrl, newItem.thumbnailUrl);
                }
            };
}
