package com.cliplocker.app.core.detector

import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.SecretTtl
import com.cliplocker.app.core.model.SensitiveType
import java.security.MessageDigest
import kotlin.math.ln

data class SensitiveDetectionResult(
    val isSensitive: Boolean,
    val type: SensitiveType,
    val suggestedTtl: SecretTtl?,
    val detectedClipType: ClipType
)

object SensitiveContentDetector {

    // Common cloud and service API key patterns
    private val AWS_ACCESS_KEY_REGEX = Regex("\\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\\b")
    private val GITHUB_PAT_REGEX = Regex("\\bgh[pousr]_[A-Za-z0-9_]{36,255}\\b")
    private val GOOGLE_API_KEY_REGEX = Regex("\\bAIza[0-9A-Za-z\\-_]{30,40}\\b")
    private val STRIPE_KEY_REGEX = Regex("\\b(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,99}\\b")
    private val SLACK_TOKEN_REGEX = Regex("\\bxox[baprs]-[0-9a-zA-Z]{10,48}\\b")

    // Private key / PEM blocks
    private val PRIVATE_KEY_REGEX = Regex("-----BEGIN (?:[A-Z0-9 ]+)?PRIVATE KEY-----")

    // JWT (JSON Web Token) standard 3-segment base64url format
    private val JWT_REGEX = Regex("\\b[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\b")

    // Credit card candidate: 13 to 19 digits, possibly space or dash delimited
    private val CREDIT_CARD_CANDIDATE_REGEX = Regex("\\b(?:\\d[\\s-]?){13,19}\\b")

    // Key-value password hints
    private val PASSWORD_KEYWORD_REGEX = Regex(
        "(?i)\\b(?:password|passwd|pwd|db_pass|secret_key|api_secret|auth_token)\\s*[:=]\\s*([\"']?)([^\\s\"']+)\\1"
    )

    // Link detector regex (offline, fast RFC-like URL matching)
    private val URL_REGEX = Regex(
        "^(https?|ftp)://[a-zA-Z0-9.-]+(?:\\.[a-zA-Z]{2,})+(?::\\d+)?(?:/[^\\s]*)?$",
        RegexOption.IGNORE_CASE
    )

    /**
     * Inspects text content offline to detect sensitive credentials, tokens, cards, or passwords.
     */
    fun detect(text: String): SensitiveDetectionResult {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) {
            return SensitiveDetectionResult(
                isSensitive = false,
                type = SensitiveType.NONE,
                suggestedTtl = null,
                detectedClipType = ClipType.TEXT
            )
        }

        // 1. Private Keys
        if (PRIVATE_KEY_REGEX.containsMatchIn(trimmed)) {
            return SensitiveDetectionResult(
                isSensitive = true,
                type = SensitiveType.PRIVATE_KEY,
                suggestedTtl = SecretTtl.ONE_HOUR,
                detectedClipType = ClipType.SECRET
            )
        }

        // 2. AWS, GitHub, Google, Stripe, Slack API Keys
        if (AWS_ACCESS_KEY_REGEX.containsMatchIn(trimmed) ||
            GITHUB_PAT_REGEX.containsMatchIn(trimmed) ||
            GOOGLE_API_KEY_REGEX.containsMatchIn(trimmed) ||
            STRIPE_KEY_REGEX.containsMatchIn(trimmed) ||
            SLACK_TOKEN_REGEX.containsMatchIn(trimmed)
        ) {
            return SensitiveDetectionResult(
                isSensitive = true,
                type = SensitiveType.API_KEY,
                suggestedTtl = SecretTtl.ONE_HOUR,
                detectedClipType = ClipType.SECRET
            )
        }

        // 3. JWT Tokens
        if (JWT_REGEX.containsMatchIn(trimmed)) {
            return SensitiveDetectionResult(
                isSensitive = true,
                type = SensitiveType.JWT,
                suggestedTtl = SecretTtl.ONE_HOUR,
                detectedClipType = ClipType.SECRET
            )
        }

        // 4. Credit Card Numbers (validated strictly via Luhn)
        for (match in CREDIT_CARD_CANDIDATE_REGEX.findAll(trimmed)) {
            val candidate = match.value
            if (LuhnValidator.isRecognizedCard(candidate)) {
                return SensitiveDetectionResult(
                    isSensitive = true,
                    type = SensitiveType.CREDIT_CARD,
                    suggestedTtl = SecretTtl.FIVE_MINUTES,
                    detectedClipType = ClipType.SECRET
                )
            }
        }

        // 5. Password-shaped strings: explicit prefix or high entropy credential
        if (PASSWORD_KEYWORD_REGEX.containsMatchIn(trimmed)) {
            return SensitiveDetectionResult(
                isSensitive = true,
                type = SensitiveType.PASSWORD,
                suggestedTtl = SecretTtl.FIVE_MINUTES,
                detectedClipType = ClipType.SECRET
            )
        }

        if (isPasswordLikeEntropy(trimmed)) {
            return SensitiveDetectionResult(
                isSensitive = true,
                type = SensitiveType.PASSWORD,
                suggestedTtl = SecretTtl.FIVE_MINUTES,
                detectedClipType = ClipType.SECRET
            )
        }

        // 6. Check if it's a URL
        val isUrl = URL_REGEX.matches(trimmed)

        return SensitiveDetectionResult(
            isSensitive = false,
            type = SensitiveType.NONE,
            suggestedTtl = null,
            detectedClipType = if (isUrl) ClipType.LINK else ClipType.TEXT
        )
    }

    /**
     * Determines if a single-token string looks like a randomly generated password or secret token.
     */
    fun isPasswordLikeEntropy(text: String): Boolean {
        // High likelihood passwords are 12 to 64 chars long without whitespace
        if (text.length !in 12..64) return false
        if (text.any { it.isWhitespace() }) return false

        val hasLower = text.any { it.isLowerCase() }
        val hasUpper = text.any { it.isUpperCase() }
        val hasDigit = text.any { it.isDigit() }
        val hasSymbol = text.any { !it.isLetterOrDigit() }

        // Must mix at least 3 character classes (e.g. lower + upper + digit, or lower + digit + symbol)
        val charClassCount = listOf(hasLower, hasUpper, hasDigit, hasSymbol).count { it }
        if (charClassCount < 3) return false

        // Calculate Shannon entropy (bits per character)
        val entropy = calculateShannonEntropy(text)
        return entropy >= 3.2
    }

    /**
     * Calculates Shannon Entropy H(X) = -sum(p_i * log2(p_i))
     */
    fun calculateShannonEntropy(input: String): Double {
        if (input.isEmpty()) return 0.0
        val freqMap = HashMap<Char, Int>()
        for (c in input) {
            freqMap[c] = (freqMap[c] ?: 0) + 1
        }

        val len = input.length.toDouble()
        var entropy = 0.0
        val log2 = ln(2.0)

        for (count in freqMap.values) {
            val p = count / len
            entropy -= p * (ln(p) / log2)
        }
        return entropy
    }

    /**
     * Calculates a SHA-256 hash for fast deduplication without comparing full strings.
     */
    fun computeSha256(content: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(content.toByteArray(Charsets.UTF_8))
        return hash.joinToString("") { "%02x".format(it) }
    }
}
