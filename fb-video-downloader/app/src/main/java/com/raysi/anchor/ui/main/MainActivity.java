package com.raysi.anchor.ui.main;

import android.Manifest;
import android.content.ClipData;
import android.content.ClipDescription;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.Fragment;
import androidx.transition.TransitionManager;
import androidx.viewpager2.adapter.FragmentStateAdapter;
import androidx.viewpager2.widget.ViewPager2;

import com.raysi.anchor.R;
import com.raysi.anchor.data.AnchorPreferences;
import com.raysi.anchor.data.db.AppDatabase;
import com.raysi.anchor.data.db.DownloadEntity;
import com.raysi.anchor.databinding.ActivityMainBinding;
import com.raysi.anchor.extractor.ExtractorRegistry;
import com.raysi.anchor.extractor.PlatformExtractor;
import com.raysi.anchor.extractor.util.UrlNormalizer;
import com.raysi.anchor.ui.share.ShareBottomSheetDialogFragment;
import com.raysi.anchor.util.PlatformIconHelper;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends AppCompatActivity {

    public static final String EXTRA_OPEN_LIBRARY_TAB = "extra_open_library_tab";

    private ActivityMainBinding binding;
    private AnchorPreferences prefs;
    private final ExecutorService clipboardCheckExecutor = Executors.newSingleThreadExecutor();
    @Nullable
    private String detectedClipboardUrl;
    @Nullable
    private String dismissedClipboardUrl;

    private final ActivityResultLauncher<String> notificationPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            });

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        prefs = new AnchorPreferences(this);
        applyWindowInsets();
        setupToolbarControls();
        setupInputBar();
        setupTabs(getIntent());
        requestNotificationPermissionIfNeeded();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.getBooleanExtra(EXTRA_OPEN_LIBRARY_TAB, false)) {
            binding.viewPager.setCurrentItem(1, true);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (prefs != null && binding != null) {
            binding.chipAutoDownload.setChecked(prefs.isAutoDownloadEnabled());
        }
        inspectClipboardForSupportedLink();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            inspectClipboardForSupportedLink();
        }
    }

    private void applyWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.rootMain, (v, insets) -> {
            Insets sys = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            boolean hasRail = binding.navRail != null;
            binding.topBarContainer.setPadding(
                    hasRail ? 0 : sys.left,
                    sys.top,
                    sys.right,
                    0
            );
            if (binding.navRail != null) {
                binding.navRail.setPadding(sys.left, sys.top, 0, sys.bottom);
            }
            if (binding.bottomNavContainer != null) {
                binding.bottomNavContainer.setPadding(sys.left, 0, sys.right, sys.bottom);
            }
            return WindowInsetsCompat.CONSUMED;
        });
    }

    private void setupToolbarControls() {
        binding.chipAutoDownload.setChecked(prefs.isAutoDownloadEnabled());
        binding.chipAutoDownload.setOnCheckedChangeListener((chip, checked) ->
                prefs.setAutoDownloadEnabled(checked));
    }

    private void setupInputBar() {
        binding.etUrlInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                boolean hasText = s != null && s.toString().trim().length() > 0;
                binding.btnClearUrl.setVisibility(hasText ? View.VISIBLE : View.GONE);
                binding.btnPasteFetch.setText(hasText ? R.string.action_fetch : R.string.action_paste_fetch);
            }

            @Override
            public void afterTextChanged(Editable s) {
            }
        });

        binding.etUrlInput.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_GO || actionId == EditorInfo.IME_ACTION_DONE) {
                triggerPasteOrFetch();
                return true;
            }
            return false;
        });

        binding.btnClearUrl.setOnClickListener(v -> binding.etUrlInput.setText(""));
        binding.btnPasteFetch.setOnClickListener(v -> triggerPasteOrFetch());

        binding.btnClipboardDownload.setOnClickListener(v -> {
            if (detectedClipboardUrl != null) {
                String target = detectedClipboardUrl;
                dismissedClipboardUrl = target;
                hideClipboardBanner();
                openFetchSheet(target);
            }
        });

        binding.btnClipboardDismiss.setOnClickListener(v -> {
            dismissedClipboardUrl = detectedClipboardUrl;
            hideClipboardBanner();
        });
    }

    private void setupTabs(@Nullable Intent launchIntent) {
        binding.viewPager.setAdapter(new FragmentStateAdapter(this) {
            @Override
            public int getItemCount() {
                return 2;
            }

            @NonNull
            @Override
            public Fragment createFragment(int position) {
                return position == 1 ? new LibraryFragment() : new QueueFragment();
            }
        });

        binding.viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                int targetId = position == 1 ? R.id.nav_library : R.id.nav_queue;
                if (binding.bottomNav != null && binding.bottomNav.getSelectedItemId() != targetId) {
                    binding.bottomNav.setSelectedItemId(targetId);
                }
                if (binding.navRail != null && binding.navRail.getSelectedItemId() != targetId) {
                    binding.navRail.setSelectedItemId(targetId);
                }
            }
        });

        if (binding.bottomNav != null) {
            binding.bottomNav.setOnItemSelectedListener(item -> selectTabByMenuId(item.getItemId()));
        }
        if (binding.navRail != null) {
            binding.navRail.setOnItemSelectedListener(item -> selectTabByMenuId(item.getItemId()));
        }

        if (launchIntent != null && launchIntent.getBooleanExtra(EXTRA_OPEN_LIBRARY_TAB, false)) {
            binding.viewPager.setCurrentItem(1, false);
        }
    }

    private boolean selectTabByMenuId(int id) {
        if (id == R.id.nav_library) {
            binding.viewPager.setCurrentItem(1, true);
            return true;
        } else if (id == R.id.nav_queue) {
            binding.viewPager.setCurrentItem(0, true);
            return true;
        }
        return false;
    }

    private void triggerPasteOrFetch() {
        String current = binding.etUrlInput.getText() != null
                ? binding.etUrlInput.getText().toString().trim()
                : "";
        if (current.isEmpty()) {
            String clipText = readClipboardText();
            String url = UrlNormalizer.extractFirstUrl(clipText);
            if (url == null) {
                Toast.makeText(this, "No valid link found in clipboard", Toast.LENGTH_SHORT).show();
                return;
            }
            binding.etUrlInput.setText(url);
            openFetchSheet(url);
        } else {
            String url = UrlNormalizer.extractFirstUrl(current);
            if (url == null) {
                Toast.makeText(this, "Enter a valid http/https link", Toast.LENGTH_SHORT).show();
                return;
            }
            openFetchSheet(url);
        }
    }

    private void openFetchSheet(@NonNull String url) {
        ShareBottomSheetDialogFragment sheet = ShareBottomSheetDialogFragment.newInstance(url, false);
        sheet.show(getSupportFragmentManager(), "fetch_sheet");
    }

    private void inspectClipboardForSupportedLink() {
        if (!hasWindowFocus()) {
            return;
        }
        String clipText = readClipboardText();
        String url = UrlNormalizer.extractFirstUrl(clipText);
        if (url == null || !ExtractorRegistry.getDefault().isSupportedShareCandidate(url)) {
            return;
        }
        String normalized = UrlNormalizer.normalize(url);
        if (normalized == null || normalized.equals(dismissedClipboardUrl)) {
            return;
        }

        clipboardCheckExecutor.execute(() -> {
            DownloadEntity existing = AppDatabase.getInstance(this).downloadDao().findLatestBySourceUrl(normalized);
            if (existing != null) {
                return;
            }
            PlatformExtractor plugin = ExtractorRegistry.getDefault().route(Uri.parse(normalized));
            String platformId = plugin != null ? plugin.getPlatformId() : "generic";

            runOnUiThread(() -> {
                if (isDestroyed() || isFinishing() || binding == null) {
                    return;
                }
                detectedClipboardUrl = normalized;
                TransitionManager.beginDelayedTransition(binding.rootMain);
                binding.ivClipboardPlatform.setImageResource(PlatformIconHelper.iconForPlatform(platformId));
                binding.tvClipboardUrl.setText(normalized);
                binding.cardClipboardBanner.setVisibility(View.VISIBLE);
            });
        });
    }

    private void hideClipboardBanner() {
        if (binding != null && binding.cardClipboardBanner.getVisibility() == View.VISIBLE) {
            TransitionManager.beginDelayedTransition(binding.rootMain);
            binding.cardClipboardBanner.setVisibility(View.GONE);
        }
    }

    @Nullable
    private String readClipboardText() {
        ClipboardManager clipboard = getSystemService(ClipboardManager.class);
        if (clipboard == null || !clipboard.hasPrimaryClip()) {
            return null;
        }
        ClipDescription desc = clipboard.getPrimaryClipDescription();
        if (desc == null || (!desc.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)
                && !desc.hasMimeType(ClipDescription.MIMETYPE_TEXT_HTML))) {
            return null;
        }
        ClipData data = clipboard.getPrimaryClip();
        if (data == null || data.getItemCount() == 0) {
            return null;
        }
        CharSequence text = data.getItemAt(0).coerceToText(this);
        return text != null ? text.toString() : null;
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
    }

    @Override
    protected void onDestroy() {
        clipboardCheckExecutor.shutdownNow();
        super.onDestroy();
    }
}
