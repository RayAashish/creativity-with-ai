package org.ledger.pdf.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.ledger.pdf.data.model.DigitalCertificate
import org.ledger.pdf.security.CertGenerator
import java.io.InputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CertificateRepository @Inject constructor(
    private val certGenerator: CertGenerator
) {
    private val _certificates = MutableStateFlow<List<DigitalCertificate>>(emptyList())
    val certificates: StateFlow<List<DigitalCertificate>> = _certificates.asStateFlow()

    suspend fun refresh() = withContext(Dispatchers.IO) {
        _certificates.value = certGenerator.listCertificates()
    }

    suspend fun createSelfSigned(
        alias: String,
        commonName: String,
        organization: String = "Ledger User",
        validityDays: Int = 365
    ): DigitalCertificate = withContext(Dispatchers.IO) {
        val cert = certGenerator.createSelfSignedCertificate(
            alias = alias,
            commonName = commonName,
            organization = organization,
            validityDays = validityDays
        )
        refresh()
        cert
    }

    suspend fun importPkcs12(
        inputStream: InputStream,
        password: String
    ): List<DigitalCertificate> = withContext(Dispatchers.IO) {
        val imported = certGenerator.importPkcs12(inputStream, password)
        refresh()
        imported
    }

    suspend fun deleteCertificate(alias: String) = withContext(Dispatchers.IO) {
        certGenerator.deleteCertificate(alias)
        refresh()
    }
}
