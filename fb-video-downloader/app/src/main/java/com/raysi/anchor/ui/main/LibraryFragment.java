package com.raysi.anchor.ui.main;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.PopupMenu;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.raysi.anchor.R;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.databinding.FragmentLibraryBinding;
import com.raysi.anchor.util.ResponsiveGridHelper;

import java.util.List;

public final class LibraryFragment extends Fragment implements LibraryAdapter.ItemListener {

    private FragmentLibraryBinding binding;
    private MainViewModel viewModel;
    private LibraryAdapter adapter;
    private List<DownloadEntity> latestItems = java.util.Collections.emptyList();

    @Nullable
    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater,
            @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState
    ) {
        binding = FragmentLibraryBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);
        adapter = new LibraryAdapter(this);

        ResponsiveGridHelper.attachAdaptiveGrid(binding.recyclerLibrary, 175, 2, 6);
        binding.recyclerLibrary.setAdapter(adapter);

        binding.chipGroupPlatforms.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) {
                return;
            }
            int checkedId = checkedIds.get(0);
            if (checkedId == R.id.chip_facebook) {
                viewModel.setPlatformFilter("facebook");
            } else if (checkedId == R.id.chip_instagram) {
                viewModel.setPlatformFilter("instagram");
            } else if (checkedId == R.id.chip_x) {
                viewModel.setPlatformFilter("x");
            } else if (checkedId == R.id.chip_reddit) {
                viewModel.setPlatformFilter("reddit");
            } else if (checkedId == R.id.chip_other) {
                viewModel.setPlatformFilter(MainViewModel.FILTER_OTHER);
            } else {
                viewModel.setPlatformFilter(MainViewModel.FILTER_ALL);
            }
        });

        viewModel.getLibraryItems().observe(getViewLifecycleOwner(), items -> {
            latestItems = items != null ? items : java.util.Collections.emptyList();
            adapter.submitList(latestItems);
            boolean empty = latestItems.isEmpty();
            binding.emptyLibrary.setVisibility(empty ? View.VISIBLE : View.GONE);
            binding.recyclerLibrary.setVisibility(empty ? View.GONE : View.VISIBLE);
        });
    }

    @Override
    public void onItemClick(DownloadEntity entity) {
        MediaPreviewDialogFragment preview = MediaPreviewDialogFragment.newInstance(entity);
        preview.setActionCallback(new MediaPreviewDialogFragment.ActionCallback() {
            @Override
            public void onShare(long id) {
                findByIdAndRun(id, LibraryFragment.this::shareMedia);
            }

            @Override
            public void onOpenOriginal(String sourceUrl) {
                openOriginalPost(sourceUrl);
            }

            @Override
            public void onDelete(long id) {
                findByIdAndRun(id, LibraryFragment.this::confirmDelete);
            }
        });
        preview.show(getChildFragmentManager(), "media_preview");
    }

    @Override
    public void onMoreClick(DownloadEntity entity, View anchor) {
        PopupMenu popup = new PopupMenu(requireContext(), anchor);
        popup.inflate(R.menu.library_item_menu);
        popup.setOnMenuItemClickListener(item -> {
            int id = item.getItemId();
            if (id == R.id.action_share) {
                shareMedia(entity);
                return true;
            } else if (id == R.id.action_open_post) {
                openOriginalPost(entity.sourceUrl);
                return true;
            } else if (id == R.id.action_delete) {
                confirmDelete(entity);
                return true;
            }
            return false;
        });
        popup.show();
    }

    private void findByIdAndRun(long id, java.util.function.Consumer<DownloadEntity> consumer) {
        for (DownloadEntity e : latestItems) {
            if (e.id == id) {
                consumer.accept(e);
                return;
            }
        }
    }

    private void shareMedia(DownloadEntity entity) {
        if (entity.mediaStoreUri == null || entity.mediaStoreUri.isBlank()) {
            return;
        }
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType(entity.mimeType);
        shareIntent.putExtra(Intent.EXTRA_STREAM, Uri.parse(entity.mediaStoreUri));
        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            startActivity(Intent.createChooser(shareIntent, getString(R.string.action_share)));
        } catch (ActivityNotFoundException ignored) {
        }
    }

    private void openOriginalPost(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) {
            return;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(sourceUrl)));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(requireContext(), "No browser app found", Toast.LENGTH_SHORT).show();
        }
    }

    private void confirmDelete(DownloadEntity entity) {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle(R.string.dialog_delete_title)
                .setMessage(R.string.dialog_delete_message)
                .setNegativeButton(R.string.action_cancel, null)
                .setPositiveButton(R.string.action_delete, (d, which) -> viewModel.deleteLibraryItem(entity))
                .show();
    }

    @Override
    public void onDestroyView() {
        binding = null;
        super.onDestroyView();
    }
}
