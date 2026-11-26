# Adding New Platform Extractors to Anchor

Anchor uses an **Open-Closed plugin architecture** in `com.raysi.anchor.extractor`. Adding support for a new public media platform takes **two steps** and requires zero changes to the UI, download engine, or routing loop.

---

## Step 1: Implement `PlatformExtractor`

Create a new class in `com.raysi.anchor.extractor.impl` implementing `PlatformExtractor`:

```java
package com.raysi.anchor.extractor.impl;

import android.net.Uri;
import androidx.annotation.NonNull;
import com.raysi.anchor.R;
import com.raysi.anchor.extractor.PlatformExtractor;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaType;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.extractor.util.UrlNormalizer;
import com.raysi.anchor.network.NetworkModule;
import java.io.IOException;
import java.util.List;
import okhttp3.OkHttpClient;
import okhttp3.Response;

public final class ExamplePlatformExtractor implements PlatformExtractor {

    @NonNull
    @Override
    public String getPlatformId() {
        return "example";
    }

    @NonNull
    @Override
    public String getDisplayName() {
        return "Example";
    }

    @Override
    public int getBadgeIconRes() {
        return R.drawable.ic_platform_generic; // Or a dedicated ic_platform_example vector
    }

    @Override
    public boolean canHandle(@NonNull Uri canonicalUri) {
        String host = canonicalUri.getHost();
        return host != null && UrlNormalizer.hostMatches(host, "example.com");
    }

    @NonNull
    @Override
    public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException {
        try (Response response = client.newCall(NetworkModule.newHtmlRequest(canonicalUrl)).execute()) {
            if (!response.isSuccessful() || response.body() == null) {
                return ExtractionResult.failure(
                        getPlatformId(),
                        canonicalUrl,
                        ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Example returned HTTP " + response.code()
                );
            }
            // Parse public HTML / JSON metadata and return highest-quality variants first
            return ExtractionResult.success(
                    getPlatformId(),
                    getDisplayName(),
                    getBadgeIconRes(),
                    canonicalUrl,
                    "Extracted Title",
                    null,
                    "https://cdn.example.com/thumb.jpg",
                    List.of(new MediaVariant("HD Video", "https://cdn.example.com/video.mp4", MediaType.VIDEO, "video/mp4", -1L, 1920, 1080, 0))
            );
        }
    }
}
```

> **Compliance Rule**: Extract only publicly accessible, non-DRM media. Never scrape user credentials, cookies, or private account data; return `ExtractionResult.failure(..., FailureReason.PRIVATE_OR_LOGIN_REQUIRED, ...)` with a clear message instead.

---

## Step 2: Register the Plugin in `ExtractorRegistry`

Register your plugin ahead of the catch-all `GenericOpenGraphExtractor` inside `ExtractorRegistry.createDefault(OkHttpClient)`:

```java
registry.register(new FacebookExtractor());
registry.register(new InstagramExtractor());
registry.register(new XTwitterExtractor());
registry.register(new RedditExtractor());
registry.register(new ExamplePlatformExtractor()); // <-- Register before fallback
registry.register(new GenericOpenGraphExtractor());
```

Or register dynamically at runtime using `ExtractorRegistry.getDefault().registerBeforeFallback(new ExamplePlatformExtractor())`.
