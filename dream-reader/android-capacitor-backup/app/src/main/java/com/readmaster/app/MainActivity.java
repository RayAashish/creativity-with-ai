package com.readmaster.app;

import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on while studying and annotating
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Request 120Hz/144Hz high refresh rate for ultra-low stylus latency (Moto Pad 70 Pro)
        WindowManager.LayoutParams params = getWindow().getAttributes();
        params.preferredRefreshRate = 144.0f;
        getWindow().setAttributes(params);

        // Ensure app content sits cleanly below system status bar (wifi, time, battery)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, insets) -> {
            int topInset = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            view.setPadding(0, topInset, 0, 0);
            return insets;
        });
    }
}

