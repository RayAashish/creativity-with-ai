package com.cliplocker.app.core.crypto

import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

object BackupEncryption {

    private val MAGIC_HEADER = "CLPLCK1".toByteArray(Charsets.US_ASCII)
    private const val SALT_SIZE_BYTES = 16
    private const val IV_SIZE_BYTES = 12
    private const val KEY_LENGTH_BITS = 256
    private const val PBKDF2_ITERATIONS = 100_000

    /**
     * Encrypts plaintext JSON bytes with a password using PBKDF2 + AES-GCM.
     * Output format: [7 bytes Header "CLPLCK1"][16 bytes Salt][12 bytes IV][Ciphertext + 16 bytes GCM Tag]
     */
    fun encrypt(plaintext: ByteArray, passphraseChars: CharArray): ByteArray {
        val random = SecureRandom()
        val salt = ByteArray(SALT_SIZE_BYTES).apply { random.nextBytes(this) }
        val iv = ByteArray(IV_SIZE_BYTES).apply { random.nextBytes(this) }

        val keySpec = PBEKeySpec(passphraseChars, salt, PBKDF2_ITERATIONS, KEY_LENGTH_BITS)
        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val secretKeyBytes = keyFactory.generateSecret(keySpec).encoded
        val secretKey = SecretKeySpec(secretKeyBytes, "AES")

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec)
        val ciphertext = cipher.doFinal(plaintext)

        return MAGIC_HEADER + salt + iv + ciphertext
    }

    /**
     * Decrypts ciphertext bytes using user-supplied passphrase.
     * Throws [IllegalArgumentException] or [javax.crypto.AEADBadTagException] if password or payload is invalid.
     */
    fun decrypt(encryptedPayload: ByteArray, passphraseChars: CharArray): ByteArray {
        val headerLen = MAGIC_HEADER.size
        val minLen = headerLen + SALT_SIZE_BYTES + IV_SIZE_BYTES + 16 // 16 bytes auth tag minimum
        require(encryptedPayload.size >= minLen) { "Payload too short or corrupt" }

        // Validate magic header
        for (i in 0 until headerLen) {
            if (encryptedPayload[i] != MAGIC_HEADER[i]) {
                throw IllegalArgumentException("Not a valid Cliplocker backup file format")
            }
        }

        var offset = headerLen
        val salt = encryptedPayload.copyOfRange(offset, offset + SALT_SIZE_BYTES)
        offset += SALT_SIZE_BYTES

        val iv = encryptedPayload.copyOfRange(offset, offset + IV_SIZE_BYTES)
        offset += IV_SIZE_BYTES

        val ciphertext = encryptedPayload.copyOfRange(offset, encryptedPayload.size)

        val keySpec = PBEKeySpec(passphraseChars, salt, PBKDF2_ITERATIONS, KEY_LENGTH_BITS)
        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val secretKeyBytes = keyFactory.generateSecret(keySpec).encoded
        val secretKey = SecretKeySpec(secretKeyBytes, "AES")

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec)
        return cipher.doFinal(ciphertext)
    }
}
