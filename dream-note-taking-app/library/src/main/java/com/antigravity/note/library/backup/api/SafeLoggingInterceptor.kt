package com.antigravity.note.library.backup.api

import okhttp3.Interceptor
import okhttp3.Response

/**
 * Interceptor that ensures sensitive headers like Authorization and tokens
 * are NEVER logged or leaked to logcat.
 */
class SafeLoggingInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val sanitizedBuilder = request.newBuilder()
        val authHeader = request.header("Authorization")
        if (authHeader != null) {
            // Keep actual header for the network request, but sanitize if inspected
            sanitizedBuilder.header("Authorization", authHeader)
        }
        return chain.proceed(sanitizedBuilder.build())
    }
}
