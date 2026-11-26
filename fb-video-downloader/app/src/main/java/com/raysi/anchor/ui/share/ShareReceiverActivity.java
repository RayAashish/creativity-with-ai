package com.raysi.anchor.ui.share;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

/**
 * Translucent floating Share Sheet receiver launched directly over any source app
 * when the user shares a public media URL to Anchor.
 */
public final class ShareReceiverActivity extends AppCompatActivity implements ShareBottomSheetDialogFragment.DismissCallback {

    private static final String TAG_SHARE_SHEET = "anchor_share_sheet";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShareIntent(intent);
    }

    private void handleShareIntent(@Nullable Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            finish();
            return;
        }
        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (sharedText == null || sharedText.isBlank()) {
            sharedText = intent.getStringExtra(Intent.EXTRA_SUBJECT);
        }
        if (sharedText == null || sharedText.isBlank()) {
            finish();
            return;
        }

        Fragment existing = getSupportFragmentManager().findFragmentByTag(TAG_SHARE_SHEET);
        if (existing instanceof ShareBottomSheetDialogFragment sheet) {
            sheet.setDismissCallback(this);
            sheet.updateSharedInput(sharedText);
        } else {
            ShareBottomSheetDialogFragment sheet = ShareBottomSheetDialogFragment.newInstance(sharedText, true);
            sheet.setDismissCallback(this);
            sheet.show(getSupportFragmentManager(), TAG_SHARE_SHEET);
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onSheetDismissed() {
        if (!isFinishing() && !isDestroyed()) {
            finish();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                overrideActivityTransition(OVERRIDE_TRANSITION_CLOSE, 0, 0);
            } else {
                overridePendingTransition(0, 0);
            }
        }
    }
}
