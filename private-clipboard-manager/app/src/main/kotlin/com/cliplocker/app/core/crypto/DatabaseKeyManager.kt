package com.cliplocker.app.core.crypto

import android.content.Context
import java.io.File
import java.security.SecureRandom

class DatabaseKeyManager(
    private val context: Context,
    private val keystoreHelper: KeystoreHelper = KeystoreHelper()
) {
    private val vaultDir: File
        get() = File(context.filesDir, "vault").apply { if (!exists()) mkdirs() }

    private val keyFile: File
        get() = File(vaultDir, "cliplocker_db.vault")

    @Synchronized
    fun getOrCreateDatabasePassphrase(): ByteArray {
        if (!keyFile.exists() || keyFile.length() == 0L) {
            // Generate a fresh cryptographically secure 256-bit (32 byte) passphrase
            val rawPassphrase = ByteArray(32)
            SecureRandom().nextBytes(rawPassphrase)

            // Encrypt with Android Keystore
            val encryptedBytes = keystoreHelper.encrypt(rawPassphrase)
            keyFile.writeBytes(encryptedBytes)
            return rawPassphrase
        }

        val encryptedBytes = keyFile.readBytes()
        return keystoreHelper.decrypt(encryptedBytes)
    }

    /**
     * Wipes the encryption key file. Calling this renders previous encrypted DB inaccessible.
     */
    @Synchronized
    fun resetDatabaseKey() {
        if (keyFile.exists()) {
            keyFile.delete()
        }
    }
}
