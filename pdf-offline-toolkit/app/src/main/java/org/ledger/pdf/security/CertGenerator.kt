package org.ledger.pdf.security

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import org.bouncycastle.asn1.x500.X500Name
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder
import org.ledger.pdf.data.model.DigitalCertificate
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.math.BigInteger
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Security
import java.security.cert.Certificate
import java.security.cert.X509Certificate
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CertGenerator @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val keyStoreFile by lazy {
        File(context.filesDir, "ledger_keystore.p12")
    }

    private val keyStorePassword = "ledger_internal_store_pass".toCharArray()

    init {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(BouncyCastleProvider())
        }
    }

    @Synchronized
    private fun loadOrCreateKeyStore(): KeyStore {
        val keyStore = KeyStore.getInstance("PKCS12")
        if (keyStoreFile.exists()) {
            FileInputStream(keyStoreFile).use { fis ->
                keyStore.load(fis, keyStorePassword)
            }
        } else {
            keyStore.load(null, keyStorePassword)
            saveKeyStore(keyStore)
        }
        return keyStore
    }

    @Synchronized
    private fun saveKeyStore(keyStore: KeyStore) {
        FileOutputStream(keyStoreFile).use { fos ->
            keyStore.store(fos, keyStorePassword)
        }
    }

    /**
     * Generates a new self-signed RSA-2048 keypair and X.509 certificate.
     */
    fun createSelfSignedCertificate(
        alias: String,
        commonName: String,
        organization: String = "Ledger Offline User",
        country: String = "XX",
        validityDays: Int = 365
    ): DigitalCertificate {
        val kpg = KeyPairGenerator.getInstance("RSA")
        kpg.initialize(2048)
        val keyPair: KeyPair = kpg.generateKeyPair()

        val notBefore = Date(System.currentTimeMillis() - 60_000L)
        val notAfter = Date(System.currentTimeMillis() + validityDays.toLong() * 24 * 60 * 60 * 1000L)
        val serialNumber = BigInteger.valueOf(System.currentTimeMillis())

        val subject = X500Name("CN=$commonName, O=$organization, C=$country")
        val certBuilder = JcaX509v3CertificateBuilder(
            subject,
            serialNumber,
            notBefore,
            notAfter,
            subject,
            keyPair.public
        )

        val signer = JcaContentSignerBuilder("SHA256withRSA")
            .setProvider(BouncyCastleProvider.PROVIDER_NAME)
            .build(keyPair.private)

        val holder = certBuilder.build(signer)
        val cert: X509Certificate = JcaX509CertificateConverter()
            .setProvider(BouncyCastleProvider.PROVIDER_NAME)
            .getCertificate(holder)

        val keyStore = loadOrCreateKeyStore()
        val certChain = arrayOf<Certificate>(cert)
        keyStore.setKeyEntry(alias, keyPair.private, keyStorePassword, certChain)
        saveKeyStore(keyStore)

        return DigitalCertificate(
            alias = alias,
            subjectDn = cert.subjectDN.name,
            issuerDn = cert.issuerDN.name,
            validFrom = cert.notBefore.time,
            validUntil = cert.notAfter.time,
            serialNumber = cert.serialNumber.toString(16),
            isSelfSigned = true,
            hasPrivateKey = true
        )
    }

    /**
     * Imports an existing PKCS#12 (.p12 / .pfx) file.
     */
    fun importPkcs12(inputStream: InputStream, password: String, aliasPrefix: String = "imported"): List<DigitalCertificate> {
        val importStore = KeyStore.getInstance("PKCS12")
        importStore.load(inputStream, password.toCharArray())

        val internalStore = loadOrCreateKeyStore()
        val results = mutableListOf<DigitalCertificate>()

        val aliases = importStore.aliases()
        while (aliases.hasMoreElements()) {
            val alias = aliases.nextElement()
            if (importStore.isKeyEntry(alias)) {
                val key = importStore.getKey(alias, password.toCharArray()) as? PrivateKey
                val chain = importStore.getCertificateChain(alias)
                if (key != null && !chain.isNullOrEmpty()) {
                    val newAlias = "${aliasPrefix}_$alias"
                    internalStore.setKeyEntry(newAlias, key, keyStorePassword, chain)
                    val cert = chain[0] as? X509Certificate
                    if (cert != null) {
                        results.add(
                            DigitalCertificate(
                                alias = newAlias,
                                subjectDn = cert.subjectDN.name,
                                issuerDn = cert.issuerDN.name,
                                validFrom = cert.notBefore.time,
                                validUntil = cert.notAfter.time,
                                serialNumber = cert.serialNumber.toString(16),
                                isSelfSigned = cert.subjectDN == cert.issuerDN,
                                hasPrivateKey = true
                            )
                        )
                    }
                }
            }
        }

        saveKeyStore(internalStore)
        return results
    }

    /**
     * Lists all stored digital certificates.
     */
    fun listCertificates(): List<DigitalCertificate> {
        val keyStore = loadOrCreateKeyStore()
        val list = mutableListOf<DigitalCertificate>()
        val aliases = keyStore.aliases()

        while (aliases.hasMoreElements()) {
            val alias = aliases.nextElement()
            val cert = keyStore.getCertificate(alias) as? X509Certificate
            val hasKey = keyStore.isKeyEntry(alias)
            if (cert != null) {
                list.add(
                    DigitalCertificate(
                        alias = alias,
                        subjectDn = cert.subjectDN.name,
                        issuerDn = cert.issuerDN.name,
                        validFrom = cert.notBefore.time,
                        validUntil = cert.notAfter.time,
                        serialNumber = cert.serialNumber.toString(16),
                        isSelfSigned = cert.subjectDN == cert.issuerDN,
                        hasPrivateKey = hasKey
                    )
                )
            }
        }
        return list
    }

    fun getKeyAndChain(alias: String): Pair<PrivateKey, Array<Certificate>>? {
        val keyStore = loadOrCreateKeyStore()
        if (!keyStore.containsAlias(alias) || !keyStore.isKeyEntry(alias)) {
            return null
        }
        val key = keyStore.getKey(alias, keyStorePassword) as? PrivateKey ?: return null
        val chain = keyStore.getCertificateChain(alias) ?: return null
        return Pair(key, chain)
    }

    fun deleteCertificate(alias: String) {
        val keyStore = loadOrCreateKeyStore()
        if (keyStore.containsAlias(alias)) {
            keyStore.deleteEntry(alias)
            saveKeyStore(keyStore)
        }
    }
}
