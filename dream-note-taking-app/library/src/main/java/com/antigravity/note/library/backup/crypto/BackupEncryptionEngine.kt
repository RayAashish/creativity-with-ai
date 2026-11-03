package com.antigravity.note.library.backup.crypto

import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

data class EncryptedPayload(
    val iv: ByteArray,
    val ciphertext: ByteArray,
    val salt: ByteArray
)

class BackupEncryptionEngine(
    private val masterKey: SecretKey? = null
) {
    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_TAG_LENGTH_BITS = 128
        private const val IV_LENGTH_BYTES = 12
        private const val SALT_LENGTH_BYTES = 16
        private const val KDF_ITERATIONS = 100_000
        private const val KEY_LENGTH_BITS = 256

        fun deriveKey(passphrase: CharArray, salt: ByteArray): SecretKey {
            val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
            val spec = PBEKeySpec(passphrase, salt, KDF_ITERATIONS, KEY_LENGTH_BITS)
            val tmp = factory.generateSecret(spec)
            return SecretKeySpec(tmp.encoded, "AES")
        }

        fun generateRandomSalt(): ByteArray {
            val random = SecureRandom()
            val salt = ByteArray(SALT_LENGTH_BYTES)
            random.nextBytes(salt)
            return salt
        }

        fun generateRandomIv(): ByteArray {
            val random = SecureRandom()
            val iv = ByteArray(IV_LENGTH_BYTES)
            random.nextBytes(iv)
            return iv
        }
    }

    fun encrypt(
        plaintext: ByteArray,
        key: SecretKey = masterKey ?: throw IllegalStateException("No encryption key provided"),
        additionalData: ByteArray? = null
    ): Pair<ByteArray, ByteArray> { // Pair(iv, ciphertext)
        val iv = generateRandomIv()
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.ENCRYPT_MODE, key, spec)
        if (additionalData != null && additionalData.isNotEmpty()) {
            cipher.updateAAD(additionalData)
        }
        val ciphertext = cipher.doFinal(plaintext)
        return Pair(iv, ciphertext)
    }

    fun decrypt(
        ciphertext: ByteArray,
        iv: ByteArray,
        key: SecretKey = masterKey ?: throw IllegalStateException("No encryption key provided"),
        additionalData: ByteArray? = null
    ): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.DECRYPT_MODE, key, spec)
        if (additionalData != null && additionalData.isNotEmpty()) {
            cipher.updateAAD(additionalData)
        }
        return cipher.doFinal(ciphertext)
    }

    /**
     * Packs IV + Ciphertext into a self-contained binary payload
     */
    fun packEncrypted(
        plaintext: ByteArray,
        key: SecretKey = masterKey ?: throw IllegalStateException("No encryption key provided")
    ): ByteArray {
        val (iv, ciphertext) = encrypt(plaintext, key)
        val buffer = java.nio.ByteBuffer.allocate(1 + iv.size + ciphertext.size)
        buffer.put(iv.size.toByte())
        buffer.put(iv)
        buffer.put(ciphertext)
        return buffer.array()
    }

    /**
     * Unpacks and decrypts self-contained binary payload
     */
    fun unpackAndDecrypt(
        packedBytes: ByteArray,
        key: SecretKey = masterKey ?: throw IllegalStateException("No encryption key provided")
    ): ByteArray {
        val buffer = java.nio.ByteBuffer.wrap(packedBytes)
        val ivLen = buffer.get().toInt()
        val iv = ByteArray(ivLen)
        buffer.get(iv)
        val ciphertext = ByteArray(buffer.remaining())
        buffer.get(ciphertext)
        return decrypt(ciphertext, iv, key)
    }
}
