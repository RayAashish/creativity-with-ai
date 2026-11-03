package com.antigravity.note.library.backup

import com.antigravity.note.library.backup.crypto.BackupEncryptionEngine
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test
import javax.crypto.AEADBadTagException

class BackupEncryptionEngineTest {

    @Test
    fun testEncryptDecryptRoundTrip() {
        val salt = BackupEncryptionEngine.generateRandomSalt()
        val key = BackupEncryptionEngine.deriveKey("my-secure-passphrase".toCharArray(), salt)
        val engine = BackupEncryptionEngine(key)

        val secretData = "InkFlow lossless handwriting strokes sample bytes 1234567890".toByteArray(Charsets.UTF_8)
        val packed = engine.packEncrypted(secretData)

        assertFalse("Ciphertext must not match plaintext", packed.contentEquals(secretData))

        val decrypted = engine.unpackAndDecrypt(packed)
        assertArrayEquals(secretData, decrypted)
        assertEquals("InkFlow lossless handwriting strokes sample bytes 1234567890", String(decrypted, Charsets.UTF_8))
    }

    @Test(expected = AEADBadTagException::class)
    fun testDecryptWithWrongKeyFails() {
        val salt = BackupEncryptionEngine.generateRandomSalt()
        val key1 = BackupEncryptionEngine.deriveKey("passphrase-A".toCharArray(), salt)
        val key2 = BackupEncryptionEngine.deriveKey("passphrase-B".toCharArray(), salt)

        val engine1 = BackupEncryptionEngine(key1)
        val engine2 = BackupEncryptionEngine(key2)

        val secretData = "Confidential data".toByteArray(Charsets.UTF_8)
        val packed = engine1.packEncrypted(secretData)

        // Attempt decrypt with wrong key should throw authentication exception
        engine2.unpackAndDecrypt(packed)
    }
}
