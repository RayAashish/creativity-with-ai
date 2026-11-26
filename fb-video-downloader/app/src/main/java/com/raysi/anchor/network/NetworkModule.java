package com.raysi.anchor.network;

import androidx.annotation.Nullable;

import java.util.concurrent.TimeUnit;

import okhttp3.ConnectionPool;
import okhttp3.OkHttpClient;
import okhttp3.Request;

/**
 * Shared OkHttp 5 client singleton with connection pooling, HTTP/2 multiplexing,
 * automatic redirect handling, and browser-grade header builders.
 */
public final class NetworkModule {

    public static final String DESKTOP_USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";

    public static final String MOBILE_USER_AGENT =
            "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36";

    public static final String REDDIT_USER_AGENT =
            "android:com.raysi.anchor:v1.0.0 (public media utility)";

    private static volatile OkHttpClient instance;

    private NetworkModule() {
    }

    public static OkHttpClient getClient() {
        OkHttpClient local = instance;
        if (local == null) {
            synchronized (NetworkModule.class) {
                local = instance;
                if (local == null) {
                    local = new OkHttpClient.Builder()
                            .connectionPool(new ConnectionPool(16, 5, TimeUnit.MINUTES))
                            .connectTimeout(15, TimeUnit.SECONDS)
                            .readTimeout(30, TimeUnit.SECONDS)
                            .writeTimeout(30, TimeUnit.SECONDS)
                            .followRedirects(true)
                            .followSslRedirects(true)
                            .retryOnConnectionFailure(true)
                            .build();
                    instance = local;
                }
            }
        }
        return local;
    }

    public static Request newHtmlRequest(String url) {
        return new Request.Builder()
                .url(url)
                .header("User-Agent", DESKTOP_USER_AGENT)
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Sec-Fetch-Mode", "navigate")
                .header("Sec-Fetch-Dest", "document")
                .header("Sec-Fetch-Site", "none")
                .get()
                .build();
    }

    public static Request newJsonRequest(String url, @Nullable String referer, @Nullable String userAgent) {
        Request.Builder builder = new Request.Builder()
                .url(url)
                .header("User-Agent", userAgent != null ? userAgent : DESKTOP_USER_AGENT)
                .header("Accept", "application/json,text/plain,*/*")
                .header("Accept-Language", "en-US,en;q=0.9")
                .get();
        if (referer != null && !referer.isEmpty()) {
            builder.header("Referer", referer);
        }
        return builder.build();
    }

    public static Request newMediaProbeRequest(String url, @Nullable String referer) {
        Request.Builder builder = new Request.Builder()
                .url(url)
                .header("User-Agent", DESKTOP_USER_AGENT)
                .header("Accept", "*/*")
                .header("Accept-Encoding", "identity")
                .head();
        if (referer != null && !referer.isEmpty()) {
            builder.header("Referer", referer);
        }
        return builder.build();
    }

    public static Request newMediaDownloadRequest(
            String url,
            @Nullable String referer,
            long rangeStart,
            long rangeEnd,
            @Nullable String ifRange
    ) {
        Request.Builder builder = new Request.Builder()
                .url(url)
                .header("User-Agent", DESKTOP_USER_AGENT)
                .header("Accept", "*/*")
                .header("Accept-Encoding", "identity")
                .get();
        if (referer != null && !referer.isEmpty()) {
            builder.header("Referer", referer);
        }
        if (rangeStart >= 0) {
            String rangeValue = rangeEnd >= rangeStart
                    ? "bytes=" + rangeStart + "-" + rangeEnd
                    : "bytes=" + rangeStart + "-";
            builder.header("Range", rangeValue);
            if (ifRange != null && !ifRange.isEmpty()) {
                builder.header("If-Range", ifRange);
            }
        }
        return builder.build();
    }
}
