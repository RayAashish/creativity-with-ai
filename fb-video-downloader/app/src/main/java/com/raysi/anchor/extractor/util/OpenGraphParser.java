package com.raysi.anchor.extractor.util;

import androidx.annotation.Nullable;

import com.raysi.anchor.extractor.model.MediaType;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.HttpUrl;

/**
 * Reusable HTML metadata parser extracting OpenGraph tags (video, audio, image), Twitter cards,
 * JSON-LD MediaObjects, canonical links, HTML5 video/audio tags, and direct downloadable asset links.
 */
public final class OpenGraphParser {

    private static final Pattern META_TAG_PATTERN = Pattern.compile(
            "<meta\\b([^>]+)>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern ATTR_PATTERN = Pattern.compile(
            "([a-zA-Z0-9_:-]+)\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>`]+))",
            Pattern.DOTALL
    );

    private static final Pattern TITLE_PATTERN = Pattern.compile(
            "<title[^>]*>(.*?)</title>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern LINK_CANONICAL_PATTERN = Pattern.compile(
            "<link\\b([^>]*rel\\s*=\\s*[\"']?canonical[\"']?[^>]*)>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern JSON_LD_PATTERN = Pattern.compile(
            "<script\\b[^>]*type\\s*=\\s*[\"']application/ld\\+json[\"'][^>]*>(.*?)</script>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern MEDIA_ELEMENT_PATTERN = Pattern.compile(
            "<(video|audio|source)\\b([^>]*)>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern ANCHOR_TAG_PATTERN = Pattern.compile(
            "<a\\b([^>]*)>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private OpenGraphParser() {
    }

    public static final class ParsedPage {
        public final Map<String, List<String>> meta = new LinkedHashMap<>();
        public final List<String> jsonLdVideoUrls = new ArrayList<>();
        public final List<String> jsonLdAudioUrls = new ArrayList<>();
        public final List<String> jsonLdImageUrls = new ArrayList<>();
        public final List<String> jsonLdOtherUrls = new ArrayList<>();
        public final List<String> htmlVideoUrls = new ArrayList<>();
        public final List<String> htmlAudioUrls = new ArrayList<>();
        public final List<String> htmlAssetLinks = new ArrayList<>();
        @Nullable
        public String title;
        @Nullable
        public String canonicalUrl;

        @Nullable
        public String firstMeta(String... keys) {
            for (String key : keys) {
                List<String> values = meta.get(key.toLowerCase(Locale.ROOT));
                if (values != null && !values.isEmpty()) {
                    return values.get(0);
                }
            }
            return null;
        }

        public List<String> allMeta(String... keys) {
            List<String> out = new ArrayList<>();
            for (String key : keys) {
                List<String> values = meta.get(key.toLowerCase(Locale.ROOT));
                if (values != null) {
                    out.addAll(values);
                }
            }
            return out;
        }
    }

    public static ParsedPage parse(String html, @Nullable String baseUrl) {
        ParsedPage page = new ParsedPage();
        if (html == null || html.isEmpty()) {
            return page;
        }

        HttpUrl base = baseUrl != null ? HttpUrl.parse(baseUrl) : null;

        Matcher metaMatcher = META_TAG_PATTERN.matcher(html);
        while (metaMatcher.find()) {
            Map<String, String> attrs = parseAttributes(metaMatcher.group(1));
            String key = attrs.get("property");
            if (key == null) {
                key = attrs.get("name");
            }
            if (key == null) {
                key = attrs.get("itemprop");
            }
            String content = attrs.get("content");
            if (key != null && content != null && !content.isBlank()) {
                String unescaped = PayloadUnescaper.unescape(content);
                if (unescaped != null && !unescaped.isEmpty()) {
                    page.meta.computeIfAbsent(key.toLowerCase(Locale.ROOT), k -> new ArrayList<>())
                            .add(unescaped);
                }
            }
        }

        Matcher titleMatcher = TITLE_PATTERN.matcher(html);
        if (titleMatcher.find()) {
            page.title = PayloadUnescaper.unescape(titleMatcher.group(1));
        }

        Matcher canonicalMatcher = LINK_CANONICAL_PATTERN.matcher(html);
        if (canonicalMatcher.find()) {
            Map<String, String> attrs = parseAttributes(canonicalMatcher.group(1));
            String href = PayloadUnescaper.unescape(attrs.get("href"));
            page.canonicalUrl = resolveUrl(base, href);
        }

        boolean insideAudioTag = false;
        Matcher mediaMatcher = MEDIA_ELEMENT_PATTERN.matcher(html);
        while (mediaMatcher.find()) {
            String tag = mediaMatcher.group(1).toLowerCase(Locale.ROOT);
            Map<String, String> attrs = parseAttributes(mediaMatcher.group(2));
            if ("audio".equals(tag)) {
                insideAudioTag = true;
            } else if ("video".equals(tag)) {
                insideAudioTag = false;
            }
            String src = attrs.get("src");
            if (src == null) {
                src = attrs.get("data-src");
            }
            String resolved = resolveUrl(base, PayloadUnescaper.unescape(src));
            if (resolved == null || resolved.startsWith("blob:")) {
                continue;
            }
            String typeAttr = attrs.get("type");
            String guessedMime = MediaMimeUtil.guessMimeFromUrl(resolved, typeAttr != null ? typeAttr : "");
            MediaType inferredType = MediaMimeUtil.mediaTypeForMime(guessedMime);
            if ("audio".equals(tag) || inferredType == MediaType.AUDIO || (insideAudioTag && "source".equals(tag))) {
                addUnique(page.htmlAudioUrls, resolved);
            } else {
                addUnique(page.htmlVideoUrls, resolved);
            }
        }

        Matcher anchorMatcher = ANCHOR_TAG_PATTERN.matcher(html);
        while (anchorMatcher.find()) {
            Map<String, String> attrs = parseAttributes(anchorMatcher.group(1));
            String href = resolveUrl(base, PayloadUnescaper.unescape(attrs.get("href")));
            if (href == null || href.startsWith("javascript:") || href.startsWith("#")) {
                continue;
            }
            if (attrs.containsKey("download") || MediaMimeUtil.isDirectMediaOrAssetUrl(href)) {
                addUnique(page.htmlAssetLinks, href);
            }
        }

        Matcher jsonLdMatcher = JSON_LD_PATTERN.matcher(html);
        while (jsonLdMatcher.find()) {
            String rawJson = jsonLdMatcher.group(1);
            if (rawJson != null && !rawJson.isBlank()) {
                extractJsonLdMedia(rawJson.trim(), base, page);
            }
        }

        return page;
    }

    private static void extractJsonLdMedia(String rawJson, @Nullable HttpUrl base, ParsedPage page) {
        try {
            Object parsed = new org.json.JSONTokener(rawJson).nextValue();
            walkJsonLd(parsed, base, page);
        } catch (Exception ignored) {
        }
    }

    private static void walkJsonLd(Object node, @Nullable HttpUrl base, ParsedPage page) {
        if (node instanceof JSONArray arr) {
            for (int i = 0; i < arr.length(); i++) {
                walkJsonLd(arr.opt(i), base, page);
            }
        } else if (node instanceof JSONObject obj) {
            String type = obj.optString("@type", "").toLowerCase(Locale.ROOT);
            String encodingFormat = obj.optString("encodingFormat", "").toLowerCase(Locale.ROOT);
            String contentUrl = resolveUrl(base, PayloadUnescaper.unescape(optNonEmpty(obj, "contentUrl")));
            if (contentUrl != null) {
                MediaType urlType = MediaMimeUtil.mediaTypeForMime(MediaMimeUtil.guessMimeFromUrl(contentUrl, encodingFormat));
                if (type.contains("audio") || type.contains("music") || type.contains("podcast") || urlType == MediaType.AUDIO) {
                    addUnique(page.jsonLdAudioUrls, contentUrl);
                } else if (type.contains("image") || urlType == MediaType.IMAGE) {
                    addUnique(page.jsonLdImageUrls, contentUrl);
                } else if (type.contains("document") || type.contains("dataset") || type.contains("datadownload")
                        || (urlType == MediaType.OTHER && !encodingFormat.isEmpty())) {
                    addUnique(page.jsonLdOtherUrls, contentUrl);
                } else {
                    addUnique(page.jsonLdVideoUrls, contentUrl);
                }
            }
            if (obj.has("video")) {
                walkJsonLd(obj.opt("video"), base, page);
            }
            if (obj.has("audio")) {
                walkJsonLd(obj.opt("audio"), base, page);
            }
            if (obj.has("associatedMedia")) {
                walkJsonLd(obj.opt("associatedMedia"), base, page);
            }
            if (obj.has("distribution")) {
                walkJsonLd(obj.opt("distribution"), base, page);
            }
            if (obj.has("@graph")) {
                walkJsonLd(obj.opt("@graph"), base, page);
            }
            if (obj.has("thumbnailUrl")) {
                Object thumb = obj.opt("thumbnailUrl");
                if (thumb instanceof String s) {
                    String resolved = resolveUrl(base, PayloadUnescaper.unescape(s));
                    if (resolved != null) {
                        addUnique(page.jsonLdImageUrls, resolved);
                    }
                }
            }
            if (page.title == null) {
                String name = optNonEmpty(obj, "headline");
                if (name == null) {
                    name = optNonEmpty(obj, "name");
                }
                if (name != null) {
                    page.title = PayloadUnescaper.unescape(name);
                }
            }
        }
    }

    @Nullable
    private static String optNonEmpty(JSONObject obj, String key) {
        String val = obj.optString(key, "");
        return val.isBlank() ? null : val;
    }

    private static void addUnique(List<String> list, String value) {
        if (!list.contains(value)) {
            list.add(value);
        }
    }

    @Nullable
    public static String resolveUrl(@Nullable HttpUrl base, @Nullable String candidate) {
        if (candidate == null || candidate.isBlank()) {
            return null;
        }
        if (base == null) {
            return candidate;
        }
        HttpUrl resolved = base.resolve(candidate);
        return resolved != null ? resolved.toString() : candidate;
    }

    public static Map<String, String> parseAttributes(String attrText) {
        Map<String, String> map = new LinkedHashMap<>();
        Matcher matcher = ATTR_PATTERN.matcher(attrText);
        while (matcher.find()) {
            String name = matcher.group(1).toLowerCase(Locale.ROOT);
            String value = matcher.group(2);
            if (value == null) {
                value = matcher.group(3);
            }
            if (value == null) {
                value = matcher.group(4);
            }
            if (value != null) {
                map.put(name, value);
            }
        }
        return map;
    }
}
