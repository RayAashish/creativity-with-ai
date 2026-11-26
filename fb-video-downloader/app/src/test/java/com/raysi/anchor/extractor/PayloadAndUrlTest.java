package com.raysi.anchor.extractor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import com.raysi.anchor.extractor.util.OpenGraphParser;
import com.raysi.anchor.extractor.util.PayloadUnescaper;
import com.raysi.anchor.extractor.util.UrlNormalizer;

import org.junit.Test;

public class PayloadAndUrlTest {

    @Test
    public void unescapesUnicodeSlashesAndHtmlEntities() {
        String raw = "https:\\/\\/video.fbcdn.net\\/v\\/t.mp4?efg=abc\\u00253D\\u0026amp;ccb=1-7&amp;oe=123&#x27;";
        String unescaped = PayloadUnescaper.unescape(raw);
        assertEquals("https://video.fbcdn.net/v/t.mp4?efg=abc%3D&ccb=1-7&oe=123'", unescaped);
    }

    @Test
    public void extractsFirstUrlAndStripsTrackingParams() {
        String shared = "Check out this clip! https://m.facebook.com/reel/987654321/?fbclid=IwAR123&utm_source=share).";
        String extracted = UrlNormalizer.extractFirstUrl(shared);
        assertEquals("https://m.facebook.com/reel/987654321/?fbclid=IwAR123&utm_source=share", extracted);

        String normalized = UrlNormalizer.normalize(extracted);
        assertEquals("https://www.facebook.com/reel/987654321/", normalized);
    }

    @Test
    public void normalizesXTrackingWhilePreservingLocalhostHttp() {
        String xUrl = "http://mobile.x.com/user/status/123456789?s=20&t=abcdef";
        assertEquals("https://x.com/user/status/123456789", UrlNormalizer.normalize(xUrl));

        String local = "http://127.0.0.1:8080/video?t=45";
        assertEquals(local, UrlNormalizer.normalize(local));
        assertNull(UrlNormalizer.extractFirstUrl("no links here"));
    }

    @Test
    public void parsesOpenGraphAndJsonLd() {
        String html = """
                <html>
                  <head>
                    <meta content="https://cdn.example.com/clip.mp4?a=1&amp;b=2" property="og:video:secure_url" />
                    <meta property="og:image" content="/poster.jpg" />
                    <meta property="og:title" content="Sample Title &amp; Clip" />
                    <script type="application/ld+json">
                      {"@type": "VideoObject", "contentUrl": "https://cdn.example.com/ld.mp4"}
                    </script>
                  </head>
                </html>
                """;
        OpenGraphParser.ParsedPage page = OpenGraphParser.parse(html, "https://example.com/post/1");
        assertEquals("https://cdn.example.com/clip.mp4?a=1&b=2", page.firstMeta("og:video:secure_url"));
        assertEquals("/poster.jpg", page.firstMeta("og:image"));
        assertEquals("Sample Title & Clip", page.firstMeta("og:title"));
        assertTrue(page.jsonLdVideoUrls.contains("https://cdn.example.com/ld.mp4"));
    }
}
