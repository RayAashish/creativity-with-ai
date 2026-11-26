package com.raysi.anchor.extractor.util;

import androidx.annotation.Nullable;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.HttpUrl;

/**
 * Extracts and canonicalizes HTTP(S) URLs from shared text, upgrading scheme where safe
 * and stripping noisy tracking query parameters.
 */
public final class UrlNormalizer {

    private static final Pattern URL_PATTERN = Pattern.compile(
            "(https?://[^\\s<>\"'`]+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Set<String> UNIVERSAL_TRACKING_PARAMS = Set.of(
            "fbclid", "igsh", "igshid", "utm_source", "utm_medium", "utm_campaign",
            "utm_term", "utm_content", "ref_src", "ref_url", "mibextid", "rdid",
            "share_id", "si", "ref", "feature"
    );

    private static final Set<String> X_TRACKING_PARAMS = Set.of("s", "t");

    private UrlNormalizer() {
    }

    @Nullable
    public static String extractFirstUrl(@Nullable String input) {
        if (input == null || input.isBlank()) {
            return null;
        }
        Matcher matcher = URL_PATTERN.matcher(input.trim());
        if (!matcher.find()) {
            return null;
        }
        String candidate = matcher.group(1);
        while (!candidate.isEmpty() && isTrailingPunctuation(candidate.charAt(candidate.length() - 1))) {
            candidate = candidate.substring(0, candidate.length() - 1);
        }
        return candidate.isEmpty() ? null : candidate;
    }

    private static boolean isTrailingPunctuation(char c) {
        return c == '.' || c == ',' || c == ';' || c == ':' || c == '!' || c == '?'
                || c == ')' || c == ']' || c == '>' || c == '"' || c == '\'';
    }

    @Nullable
    public static String normalize(@Nullable String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }
        String cleaned = PayloadUnescaper.unescape(rawUrl.trim());
        if (cleaned == null) {
            return null;
        }
        HttpUrl parsed = HttpUrl.parse(cleaned);
        if (parsed == null) {
            return null;
        }

        String host = parsed.host().toLowerCase(Locale.ROOT);
        HttpUrl.Builder builder = parsed.newBuilder();

        // Preserve http for loopback/test servers; upgrade public hosts to https
        if ("http".equalsIgnoreCase(parsed.scheme()) && !isLocalHost(host)) {
            builder.scheme("https");
        }

        String canonicalHost = canonicalizeHost(host);
        if (!canonicalHost.equals(host)) {
            builder.host(canonicalHost);
        }

        // Remove fragment unless meaningful
        builder.fragment(null);

        boolean isXHost = canonicalHost.equals("x.com") || canonicalHost.endsWith(".x.com")
                || canonicalHost.equals("twitter.com") || canonicalHost.endsWith(".twitter.com");

        for (String name : parsed.queryParameterNames()) {
            String lowerName = name.toLowerCase(Locale.ROOT);
            if (UNIVERSAL_TRACKING_PARAMS.contains(lowerName)
                    || lowerName.startsWith("utm_")
                    || (isXHost && X_TRACKING_PARAMS.contains(lowerName))) {
                builder.removeAllQueryParameters(name);
            }
        }

        return builder.build().toString();
    }

    public static boolean isLocalHost(String host) {
        return "localhost".equals(host)
                || "127.0.0.1".equals(host)
                || "10.0.2.2".equals(host)
                || host.startsWith("192.168.")
                || host.startsWith("10.");
    }

    private static String canonicalizeHost(String host) {
        return switch (host) {
            case "m.facebook.com", "mbasic.facebook.com", "web.facebook.com", "touch.facebook.com" ->
                    "www.facebook.com";
            case "mobile.twitter.com", "m.twitter.com" -> "twitter.com";
            case "mobile.x.com" -> "x.com";
            case "old.reddit.com", "np.reddit.com", "new.reddit.com" -> "www.reddit.com";
            case "instagr.am" -> "www.instagram.com";
            default -> host;
        };
    }

    public static boolean hostMatches(String host, String rootDomain) {
        if (host == null || host.isEmpty()) {
            return false;
        }
        String lowerHost = host.toLowerCase(Locale.ROOT);
        String lowerRoot = rootDomain.toLowerCase(Locale.ROOT);
        return lowerHost.equals(lowerRoot) || lowerHost.endsWith("." + lowerRoot);
    }
}
