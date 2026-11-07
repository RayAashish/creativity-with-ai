package org.ledger.pdf.ui.navigation

import android.net.Uri
import android.util.Base64

object UriRouteCodec {
    fun encode(uri: Uri): String {
        return Base64.encodeToString(
            uri.toString().toByteArray(Charsets.UTF_8),
            Base64.URL_SAFE or Base64.NO_WRAP
        )
    }

    fun decode(encoded: String): Uri {
        return try {
            val bytes = Base64.decode(encoded, Base64.URL_SAFE)
            Uri.parse(String(bytes, Charsets.UTF_8))
        } catch (_: Exception) {
            Uri.parse(encoded)
        }
    }
}

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object Merge : Screen("merge")
    data object Batch : Screen("batch")
    data object Settings : Screen("settings")

    data class Workspace(val uri: Uri) : Screen("workspace/${UriRouteCodec.encode(uri)}") {
        companion object {
            const val ROUTE_TEMPLATE = "workspace/{encodedUri}"
        }
    }

    data class Split(val uri: Uri) : Screen("split/${UriRouteCodec.encode(uri)}") {
        companion object {
            const val ROUTE_TEMPLATE = "split/{encodedUri}"
        }
    }

    data class Compress(val uri: Uri) : Screen("compress/${UriRouteCodec.encode(uri)}") {
        companion object {
            const val ROUTE_TEMPLATE = "compress/{encodedUri}"
        }
    }

    data class Ocr(val uri: Uri) : Screen("ocr/${UriRouteCodec.encode(uri)}") {
        companion object {
            const val ROUTE_TEMPLATE = "ocr/{encodedUri}"
        }
    }

    data class StripMetadata(val uri: Uri) : Screen("strip_metadata/${UriRouteCodec.encode(uri)}") {
        companion object {
            const val ROUTE_TEMPLATE = "strip_metadata/{encodedUri}"
        }
    }

    data class Sign(val uri: Uri) : Screen("sign/${UriRouteCodec.encode(uri)}") {
        companion object {
            const val ROUTE_TEMPLATE = "sign/{encodedUri}"
        }
    }
}
