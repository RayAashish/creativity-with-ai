package com.cliplocker.app

import com.cliplocker.app.core.detector.SensitiveContentDetector
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.SecretTtl
import com.cliplocker.app.core.model.SensitiveType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SensitiveContentDetectorTest {

    @Test
    fun testDetectAwsAccessKey() {
        val text = "Please use this access key: AKIAIOSFODNN7EXAMPLE for S3."
        val result = SensitiveContentDetector.detect(text)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.API_KEY, result.type)
        assertEquals(ClipType.SECRET, result.detectedClipType)
        assertEquals(SecretTtl.ONE_HOUR, result.suggestedTtl)
    }

    @Test
    fun testDetectGitHubPat() {
        val token = "ghp_AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"
        val result = SensitiveContentDetector.detect(token)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.API_KEY, result.type)
    }

    @Test
    fun testDetectStripeKey() {
        val stripeKey = "sk_live_51Hz3nS2eZvKYlo2CL8X00m23456789abcdef"
        val result = SensitiveContentDetector.detect(stripeKey)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.API_KEY, result.type)
    }

    @Test
    fun testDetectGoogleApiKey() {
        val googleKey = "AIzaSyD-1234567890abcdefghijklmnopqrst"
        val result = SensitiveContentDetector.detect(googleKey)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.API_KEY, result.type)
    }

    @Test
    fun testDetectSlackToken() {
        val slack = "xoxb-123456789012-1234567890123-456789abcdefghij"
        val result = SensitiveContentDetector.detect(slack)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.API_KEY, result.type)
    }

    @Test
    fun testDetectPrivateKeyPem() {
        val pem = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Y3...\n-----END RSA PRIVATE KEY-----"
        val result = SensitiveContentDetector.detect(pem)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.PRIVATE_KEY, result.type)
        assertEquals(ClipType.SECRET, result.detectedClipType)
    }

    @Test
    fun testDetectJwtToken() {
        val jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        val result = SensitiveContentDetector.detect(jwt)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.JWT, result.type)
        assertEquals(ClipType.SECRET, result.detectedClipType)
    }

    @Test
    fun testDetectCreditCard() {
        val text = "Pay with 4532 0151 1283 0366 today"
        val result = SensitiveContentDetector.detect(text)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.CREDIT_CARD, result.type)
        assertEquals(SecretTtl.FIVE_MINUTES, result.suggestedTtl)
    }

    @Test
    fun testDetectPasswordInKeyValue() {
        val text = "db_pass: P@ssw0rd_987#xyz!"
        val result = SensitiveContentDetector.detect(text)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.PASSWORD, result.type)
        assertEquals(SecretTtl.FIVE_MINUTES, result.suggestedTtl)
    }

    @Test
    fun testDetectHighEntropyPassword() {
        val text = "k9#VxQ!8mZ@2\$LpW"
        val result = SensitiveContentDetector.detect(text)

        assertTrue(result.isSensitive)
        assertEquals(SensitiveType.PASSWORD, result.type)
    }

    @Test
    fun testDetectLink() {
        val url = "https://github.com/cliplocker/app"
        val result = SensitiveContentDetector.detect(url)

        assertFalse(result.isSensitive)
        assertEquals(SensitiveType.NONE, result.type)
        assertEquals(ClipType.LINK, result.detectedClipType)
    }

    @Test
    fun testDetectNormalText() {
        val normal = "Hello, remember to pick up the groceries this evening."
        val result = SensitiveContentDetector.detect(normal)

        assertFalse(result.isSensitive)
        assertEquals(SensitiveType.NONE, result.type)
        assertEquals(ClipType.TEXT, result.detectedClipType)
    }
}
