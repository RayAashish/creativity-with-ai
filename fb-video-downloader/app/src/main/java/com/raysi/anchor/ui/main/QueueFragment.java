package com.raysi.anchor.ui.main;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.SimpleItemAnimator;

import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.databinding.FragmentQueueBinding;
import com.raysi.anchor.downloader.DownloadForegroundService;
import com.raysi.anchor.downloader.TransferSpeedBus;
import com.raysi.anchor.util.ResponsiveGridHelper;

public final class QueueFragment extends Fragment implements QueueAdapter.ActionListener {

    private FragmentQueueBinding binding;
    private MainViewModel viewModel;
    private QueueAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater,
            @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState
    ) {
        binding = FragmentQueueBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);
        adapter = new QueueAdapter(this);

        ResponsiveGridHelper.attachAdaptiveGrid(binding.recyclerQueue, 400, 1, 3);
        binding.recyclerQueue.setAdapter(adapter);
        if (binding.recyclerQueue.getItemAnimator() instanceof SimpleItemAnimator animator) {
            animator.setSupportsChangeAnimations(false);
        }

        viewModel.getQueueItems().observe(getViewLifecycleOwner(), items -> {
            adapter.submitList(items);
            boolean empty = items == null || items.isEmpty();
            binding.emptyQueue.setVisibility(empty ? View.VISIBLE : View.GONE);
            binding.recyclerQueue.setVisibility(empty ? View.GONE : View.VISIBLE);
        });

        TransferSpeedBus.getInstance().observeSnapshots().observe(getViewLifecycleOwner(), snapshots -> {
            if (snapshots != null) {
                adapter.updateSpeedSnapshots(snapshots);
            }
        });
    }

    @Override
    public void onPause(DownloadEntity entity) {
        DownloadForegroundService.pauseDownload(requireContext(), entity.id);
    }

    @Override
    public void onResume(DownloadEntity entity) {
        DownloadForegroundService.resumeDownload(requireContext(), entity.id);
    }

    @Override
    public void onCancel(DownloadEntity entity) {
        DownloadForegroundService.cancelDownload(requireContext(), entity.id);
    }

    @Override
    public void onDestroyView() {
        binding = null;
        super.onDestroyView();
    }
}
