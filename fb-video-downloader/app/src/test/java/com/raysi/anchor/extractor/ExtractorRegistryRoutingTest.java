package com.raysi.anchor.extractor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.net.Uri;

import androidx.annotation.NonNull;

import com.raysi.anchor.R;
import com.raysi.anchor.extractor.impl.FacebookExtractor;
import com.raysi.anchor.extractor.impl.GenericOpenGraphExtractor;
import com.raysi.anchor.extractor.impl.InstagramExtractor;
import com.raysi.anchor.extractor.impl.RedditExtractor;
import com.raysi.anchor.extractor.impl.XTwitterExtractor;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaType;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.extractor.util.RedirectResolver;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35, manifest = Config.NONE)
public class ExtractorRegistryRoutingTest {

    @Test
    public void routesAllCorePlatformsAndGenericFallback() {
        ExtractorRegistry registry = ExtractorRegistry.createDefault(new OkHttpClient());

        PlatformExtractor fb = registry.route(Uri.parse("https://www.facebook.com/watch/?v=123"));
        assertNotNull(fb);
        assertTrue(fb instanceof FacebookExtractor);

        PlatformExtractor fbWatch = registry.route(Uri.parse("https://fb.watch/abc123/"));
        assertNotNull(fbWatch);
        assertTrue(fbWatch instanceof FacebookExtractor);

        PlatformExtractor ig = registry.route(Uri.parse("https://www.instagram.com/reel/C8abc/"));
        assertNotNull(ig);
        assertTrue(ig instanceof InstagramExtractor);

        PlatformExtractor x = registry.route(Uri.parse("https://x.com/user/status/999"));
        assertNotNull(x);
        assertTrue(x instanceof XTwitterExtractor);

        PlatformExtractor reddit = registry.route(Uri.parse("https://www.reddit.com/r/pics/comments/123/title/"));
        assertNotNull(reddit);
        assertTrue(reddit instanceof RedditExtractor);

        PlatformExtractor fallback = registry.route(Uri.parse("https://vimeo.com/123456"));
        assertNotNull(fallback);
        assertTrue(fallback instanceof GenericOpenGraphExtractor);
    }

    @Test
    public void openClosedPluginRegistrationOverridesGenericFallback() {
        ExtractorRegistry registry = ExtractorRegistry.createDefault(new OkHttpClient());
        PlatformExtractor customPlugin = new PlatformExtractor() {
            @NonNull
            @Override
            public String getPlatformId() {
                return "tiktok";
            }

            @NonNull
            @Override
            public String getDisplayName() {
                return "TikTok";
            }

            @Override
            public int getBadgeIconRes() {
                return R.drawable.ic_platform_generic;
            }

            @Override
            public boolean canHandle(@NonNull Uri canonicalUri) {
                return "www.tiktok.com".equalsIgnoreCase(canonicalUri.getHost());
            }

            @NonNull
            @Override
            public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) {
                return ExtractionResult.success(
                        getPlatformId(),
                        getDisplayName(),
                        getBadgeIconRes(),
                        canonicalUrl,
                        "Sample",
                        null,
                        null,
                        List.of(new MediaVariant("HD", "https://cdn.example.com/a.mp4", MediaType.VIDEO, "video/mp4", 1024L, 1080, 1920, 0))
                );
            }
        };

        registry.registerBeforeFallback(customPlugin);
        PlatformExtractor routed = registry.route(Uri.parse("https://www.tiktok.com/@creator/video/12345"));
        assertNotNull(routed);
        assertEquals("tiktok", routed.getPlatformId());
    }

    @Test
    public void endToEndMockServerExtractionProbesContentSize() throws Exception {
        try (MockWebServer server = new MockWebServer()) {
            String videoUrl = server.url("/media/sample.mp4").toString();
            String pageHtml = "<html><head>"
                    + "<meta property=\"og:title\" content=\"Demo Clip\" />"
                    + "<meta property=\"og:video\" content=\"" + videoUrl + "\" />"
                    + "</head></html>";

            server.enqueue(new MockResponse().setResponseCode(200).setBody(pageHtml));
            server.enqueue(new MockResponse().setResponseCode(200).addHeader("Content-Length", "5242880"));
            server.start();

            ExtractorRegistry registry = ExtractorRegistry.createDefault(new OkHttpClient());
            ExtractionResult result = registry.resolveAndExtract(server.url("/post/42").toString(), true);
            assertTrue(result instanceof ExtractionResult.Success);
            ExtractionResult.Success s = (ExtractionResult.Success) result;
            assertEquals("Demo Clip", s.getTitle());
            assertEquals(5242880L, s.getBestVariant().getEstimatedBytes());
        }
    }

    @Test
    public void redirectResolverUnwrapsFacebookOutboundAndHttpRedirects() throws Exception {
        String unwrapped = RedirectResolver.resolve(
                "https://l.facebook.com/l.php?u=https%3A%2F%2Fx.com%2Fdemo%2Fstatus%2F99%3Fs%3D20",
                new OkHttpClient()
        );
        assertEquals("https://x.com/demo/status/99", unwrapped);

        try (MockWebServer server = new MockWebServer()) {
            server.enqueue(new MockResponse()
                    .setResponseCode(302)
                    .addHeader("Location", "/reel/555666/?igsh=track"));
            server.enqueue(new MockResponse()
                    .setResponseCode(200)
                    .addHeader("Content-Type", "text/html")
                    .setBody("<html><title>Reel</title></html>"));
            server.start();

            String shareUrl = server.url("/share/r/shortCode").toString();
            String resolved = RedirectResolver.resolve(shareUrl, new OkHttpClient());
            assertTrue(resolved.endsWith("/reel/555666/"));
        }
    }
}
