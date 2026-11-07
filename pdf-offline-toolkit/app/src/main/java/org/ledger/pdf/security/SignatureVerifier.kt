package org.ledger.pdf.security

import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.interactive.digitalsignature.PDSignature
import org.bouncycastle.cms.CMSSignedData
import org.bouncycastle.cms.jcajce.JcaSimpleSignerInfoVerifierBuilder
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.ledger.pdf.data.model.SignatureInfo
import java.io.InputStream
import java.security.Security
import java.security.cert.X509Certificate
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SignatureVerifier @Inject constructor() {

    init {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(BouncyCastleProvider())
        }
    }

    fun verifySignatures(inputStream: InputStream): List<SignatureInfo> {
        val results = mutableListOf<SignatureInfo>()
        val document = PDDocument.load(inputStream)

        try {
            val signatures: List<PDSignature> = document.signatureDictionaries
            for (sig in signatures) {
                val signerName = sig.name ?: "Unknown Signer"
                val signDate = sig.signDate?.timeInMillis ?: 0L
                val reason = sig.reason
                val location = sig.location
                val subFilter = sig.subFilter ?: ""

                var isValid = false
                var certSubject = "Unknown"
                var digestAlgo = "SHA-256"

                try {
                    val contents = sig.contents
                    if (contents != null && contents.isNotEmpty()) {
                        val signedData = CMSSignedData(contents)
                        val signers = signedData.signerInfos.signers
                        val certStore = signedData.certificates

                        for (signer in signers) {
                            val certMatches = certStore.getMatches(null)
                            for (holder in certMatches) {
                                val certConverter = org.bouncycastle.cert.jcajce.JcaX509CertificateConverter()
                                    .setProvider(BouncyCastleProvider.PROVIDER_NAME)
                                val x509: X509Certificate = certConverter.getCertificate(holder)
                                certSubject = x509.subjectDN.name
                                digestAlgo = signer.digestAlgorithmID.algorithm.id

                                val verifier = JcaSimpleSignerInfoVerifierBuilder()
                                    .setProvider(BouncyCastleProvider.PROVIDER_NAME)
                                    .build(x509)
                                if (signer.verify(verifier)) {
                                    isValid = true
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    isValid = false
                }

                results.add(
                    SignatureInfo(
                        signerName = signerName,
                        signDate = signDate,
                        reason = reason,
                        location = location,
                        isValid = isValid,
                        digestAlgorithm = digestAlgo,
                        certificateSubject = certSubject
                    )
                )
            }
        } finally {
            document.close()
        }

        return results
    }
}
