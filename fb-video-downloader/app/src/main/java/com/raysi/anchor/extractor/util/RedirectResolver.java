package com.raysi.anchor.extractor.util;

import androidx.annotation.NonNull;

import com.raysi.anchor.network.NetworkModule;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Resolves shortlinks and share redirects (fb.watch, t.co, instagr.am, redd.it, /share/r/, /share/v/)
 * via HTTP redirects as well as HTML meta-refresh / JS location redirects.
 */
public final class RedirectResolver {

    private static final Set<String> SHORTLINK_HOSTS = Set.of(
            "fb.watch", "l.facebook.com", "lm.facebook.com",
            "t.co", "instagr.am", "redd.it",
            "bit.ly", "tinyurl.com", "ow.ly", "buff.ly", "goo.gl"
    );

    private static final Pattern META_REFRESH_PATTERN = Pattern.compile(
            "<meta[^>]+http-equiv\\s*=\\s*[\"']?refresh[\"']?[^>]+content\\s*=\\s*[\"'][^\"']*url=([^\"';>\\s]+)[\"']?",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern JS_LOCATION_PATTERN = Pattern.compile(
            "(?:window\\.)?location\\.(?:replace|href)\\s*\\(?\\s*[\"'](https?://[^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE
    );

    private RedirectResolver() {
    }

    public static boolean needsResolution(@NonNull String url) {
        HttpUrl parsed = HttpUrl.parse(url);
        if (parsed == null) {
            return false;
        }
        String host = parsed.host().toLowerCase(Locale.ROOT);
        if (SHORTLINK_HOSTS.contains(host)) {
            return true;
        }
        String path = parsed.encodedPath().toLowerCase(Locale.ROOT);
        return path.contains("/share/") || (host.contains("reddit.com") && path.contains("/s/"));
    }

    @NonNull
    public static String resolve(@NonNull String url, @NonNull OkHttpClient client) {
        HttpUrl parsed = HttpUrl.parse(url);
        if (parsed == null) {
            return url;
        }

        // Unwrap Facebook outbound link shim l.facebook.com/l.php?u=<target>
        if ("l.facebook.com".equalsIgnoreCase(parsed.host())
                || "lm.facebook.com".equalsIgnoreCase(parsed.host())) {
            String u = parsed.queryParameter("u");
            if (u != null && (u.startsWith("http://") || u.startsWith("https://"))) {
                String normalized = UrlNormalizer.normalize(u);
                if (normalized != null) {
                    return normalized;
                }
            }
        }

        if (!needsResolution(url)) {
            String normalized = UrlNormalizer.normalize(url);
            return normalized != null ? normalized : url;
        }

        String currentUrl = url;
        for (int hop = 0; hop < 3; hop++) {
            try (Response response = client.newCall(NetworkModule.newHtmlRequest(currentUrl)).execute()) {
                String landedUrl = response.request().url().toString();
                String unwrapped = unwrapFacebookLoginNext(landedUrl);
                if (unwrapped != null) {
                    landedUrl = unwrapped;
                }

                // Check for meta-refresh or JS location redirects (used by t.co & certain share gateways)
                String contentType = response.header("Content-Type", "");
                if (response.isSuccessful() && contentType != null && contentType.contains("text/html")) {
                    String headHtml = readHeadSnippet(response.body(), 32 * 1024);
                    String scriptTarget = extractHtmlRedirect(headHtml, landedUrl);
                    if (scriptTarget != null && !scriptTarget.equals(landedUrl)) {
                        currentUrl = scriptTarget;
                        continue;
                    }
                }

                String normalized = UrlNormalizer.normalize(landedUrl);
                return normalized != null ? normalized : landedUrl;
            } catch (IOException e) {
                String normalized = UrlNormalizer.normalize(currentUrl);
                return normalized != null ? normalized : currentUrl;
            }
        }

        String normalized = UrlNormalizer.normalize(currentUrl);
        return normalized != null ? normalized : currentUrl;
    }

    private static String unwrapFacebookLoginNext(String url) {
        HttpUrl parsed = HttpUrl.parse(url);
        if (parsed == null) {
            return null;
        }
        if (UrlNormalizer.hostMatches(parsed.host(), "facebook.com")
                && parsed.encodedPath().startsWith("/login")) {
            String next = parsed.queryParameter("next");
            if (next != null && (next.startsWith("http://") || next.startsWith("https://"))) {
                return next;
            }
        }
        return null;
    }

    private static String extractHtmlRedirect(String html, String baseUrl) {
        if (html == null || html.isEmpty()) {
            return null;
        }
        Matcher meta = META_REFRESH_PATTERN.matcher(html);
        if (meta.find()) {
            String target = PayloadUnescaper.unescape(meta.group(1));
            HttpUrl base = HttpUrl.parse(baseUrl);
            return OpenGraphParser.resolveUrl(base, target);
        }
        Matcher js = JS_LOCATION_PATTERN.matcher(html);
        if (js.find()) {
            return PayloadUnescaper.unescape(js.group(1));
        }
        return null;
    }

    private static String readHeadSnippet(ResponseBody body, int maxBytes) throws IOException {
        if (body == null) {
            return "";
        }
        try (InputStream is = body.byteStream()) {
            byte[] buf = new byte[maxBytes];
            int total = 0;
            while (total < maxBytes) {
                int read = is.read(buf, total, maxBytes - total);
                if (read == -1) {
                    break;
                }
                total += read;
            }
            return new String(buf, 0, total, StandardCharsets.UTF_8);
        }
    }
}
