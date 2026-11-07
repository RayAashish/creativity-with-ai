package org.ledger.pdf

import android.net.Uri
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.ledger.pdf.engine.FakePdfEngine

class SignatureVerifierTest {

    private lateinit var fakeEngine: FakePdfEngine
    private val mockUri = mockk<Uri>(relaxed = true)

    @Before
    fun setup() {
        fakeEngine = FakePdfEngine()
    }

    @Test
    fun verifySignatures_parsesAndValidatesSigners() = runBlocking {
        val signatures = fakeEngine.verifySignatures(mockUri)

        assertNotNull(signatures)
        assertEquals(1, signatures.size)

        val sig = signatures[0]
        assertEquals("CN=Alice Smith", sig.signerName)
        assertEquals("Approval", sig.reason)
        assertEquals("Air-gapped Lab", sig.location)
        assertTrue(sig.isValid)
        assertTrue(sig.certificateSubject.contains("Alice Smith"))
    }
}
