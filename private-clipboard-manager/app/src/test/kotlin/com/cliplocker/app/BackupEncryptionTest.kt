package com.cliplocker.app

import com.cliplocker.app.core.crypto.BackupEncryption
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import javax.crypto.AEADBadTagException

class BackupEncryptionTest {

    @Test
    fun testEncryptionDecryptionRoundtrip() {
        val originalText = """{"clips":[{"content":"test clip 1","isSecret":false},{"content":"secret token","isSecret":true}]}"""
        val originalBytes = originalText.toByteArray(Charsets.UTF_8)
        val password = "correct-horse-battery-staple".toCharArray()

        val encrypted = BackupEncryption.encrypt(originalBytes, password)
        val decrypted = BackupEncryption.decrypt(encrypted, password)

        assertArrayEquals(originalBytes, decrypted)
        assertEquals(originalText, String(decrypted, Charsets.UTF_8))
    }

    @Test
    fun testWrongPasswordFails() {
        val originalText = "confidential clipboard history payload"
        val originalBytes = originalText.toByteArray(Charsets.UTF_8)
        val password = "correct-password".toCharArray()
        val wrongPassword = "wrong-password".toCharArray()

        val encrypted = BackupEncryption.encrypt(originalBytes, password)

        assertThrows(AEADBadTagException::class.java) {
            BackupEncryption.decrypt(encrypted, wrongPassword)
        }
    }

    @Test
    fun testCorruptPayloadFails() {
        val originalText = "sample payload"
        val originalBytes = originalText.toByteArray(Charsets.UTF_8)
        val password = "password123".toCharArray()

        val encrypted = BackupEncryption.encrypt(originalBytes, password)
        // Corrupt a byte in the ciphertext
        encrypted[encrypted.size - 1] = (encrypted[encrypted.size - 1].toInt() xor 0xFF).toByte()

        assertThrows(AEADBadTagException::class.java) {
            BackupEncryption.decrypt(encrypted, password)
        }
    }
}
