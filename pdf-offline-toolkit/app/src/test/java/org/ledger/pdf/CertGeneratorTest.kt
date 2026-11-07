package org.ledger.pdf

import android.content.Context
import io.mockk.every
import io.mockk.mockk
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.ledger.pdf.security.CertGenerator
import java.security.Security

class CertGeneratorTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    private lateinit var mockContext: Context
    private lateinit var certGenerator: CertGenerator

    @Before
    fun setup() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(BouncyCastleProvider())
        }
        mockContext = mockk(relaxed = true)
        every { mockContext.filesDir } returns tempFolder.root
        certGenerator = CertGenerator(mockContext)
    }

    @Test
    fun createSelfSignedCertificate_generatesValidX509() {
        val cert = certGenerator.createSelfSignedCertificate(
            alias = "test_alias",
            commonName = "Paranoid Tester",
            organization = "Air-Gapped Org",
            validityDays = 30
        )

        assertNotNull(cert)
        assertEquals("test_alias", cert.alias)
        assertEquals("Paranoid Tester", cert.commonName)
        assertTrue(cert.isSelfSigned)
        assertTrue(cert.hasPrivateKey)
        assertTrue(cert.validUntil > cert.validFrom)

        // Verify it can be listed and retrieved
        val list = certGenerator.listCertificates()
        assertEquals(1, list.size)
        assertEquals("test_alias", list[0].alias)

        val keyChain = certGenerator.getKeyAndChain("test_alias")
        assertNotNull(keyChain)
        assertNotNull(keyChain?.first)
        assertEquals(1, keyChain?.second?.size)
    }

    @Test
    fun deleteCertificate_removesEntry() {
        certGenerator.createSelfSignedCertificate("delete_me", "Ephemeral")
        assertEquals(1, certGenerator.listCertificates().size)

        certGenerator.deleteCertificate("delete_me")
        assertEquals(0, certGenerator.listCertificates().size)
    }
}
