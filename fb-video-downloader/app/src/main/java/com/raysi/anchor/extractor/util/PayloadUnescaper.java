package com.raysi.anchor.extractor.util;

import androidx.annotation.Nullable;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Unescapes JSON unicode/slash escapes (\u0025, \/, \u0026) and HTML entities (&amp;, &#x27;, etc.)
 * commonly embedded inside social media script payloads and OpenGraph tags.
 */
public final class PayloadUnescaper {

    private static final Pattern UNICODE_ESCAPE = Pattern.compile("\\\\u([0-9a-fA-F]{4})");
    private static final Pattern HEX_ENTITY = Pattern.compile("&#[xX]([0-9a-fA-F]+);");
    private static final Pattern DEC_ENTITY = Pattern.compile("&#(\\d+);");

    private PayloadUnescaper() {
    }

    @Nullable
    public static String unescape(@Nullable String raw) {
        if (raw == null || raw.isEmpty()) {
            return raw;
        }
        String current = unescapeJsonPass(raw);
        current = unescapeHtmlEntities(current);
        // Handle double-encoded entities such as \u0026amp; or &amp;quot;
        if (current.contains("&amp;") || current.contains("&#")) {
            current = unescapeHtmlEntities(current);
        }
        return current.trim();
    }

    public static String unescapeJsonPass(String input) {
        if (input.indexOf('\\') < 0) {
            return input;
        }
        StringBuffer sb = new StringBuffer(input.length());
        Matcher matcher = UNICODE_ESCAPE.matcher(input);
        while (matcher.find()) {
            String hex = matcher.group(1);
            int codePoint = Integer.parseInt(hex, 16);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(String.valueOf((char) codePoint)));
        }
        matcher.appendTail(sb);

        String pass = sb.toString();
        StringBuilder out = new StringBuilder(pass.length());
        for (int i = 0; i < pass.length(); i++) {
            char c = pass.charAt(i);
            if (c == '\\' && i + 1 < pass.length()) {
                char next = pass.charAt(i + 1);
                switch (next) {
                    case '/' -> {
                        out.append('/');
                        i++;
                    }
                    case '"' -> {
                        out.append('"');
                        i++;
                    }
                    case '\\' -> {
                        out.append('\\');
                        i++;
                    }
                    case 'n' -> {
                        out.append('\n');
                        i++;
                    }
                    case 'r' -> {
                        out.append('\r');
                        i++;
                    }
                    case 't' -> {
                        out.append('\t');
                        i++;
                    }
                    default -> out.append(c);
                }
            } else {
                out.append(c);
            }
        }
        return out.toString();
    }

    public static String unescapeHtmlEntities(String input) {
        if (input.indexOf('&') < 0) {
            return input;
        }
        String result = input
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
                .replace("&apos;", "'")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&nbsp;", " ");

        result = replaceNumericEntities(result, HEX_ENTITY, 16);
        result = replaceNumericEntities(result, DEC_ENTITY, 10);
        return result;
    }

    private static String replaceNumericEntities(String input, Pattern pattern, int radix) {
        Matcher matcher = pattern.matcher(input);
        if (!matcher.find()) {
            return input;
        }
        matcher.reset();
        StringBuffer sb = new StringBuffer(input.length());
        while (matcher.find()) {
            try {
                int codePoint = Integer.parseInt(matcher.group(1), radix);
                if (Character.isValidCodePoint(codePoint)) {
                    String replacement = new String(Character.toChars(codePoint));
                    matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
                }
            } catch (NumberFormatException ignored) {
                // Leave malformed entity intact
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
