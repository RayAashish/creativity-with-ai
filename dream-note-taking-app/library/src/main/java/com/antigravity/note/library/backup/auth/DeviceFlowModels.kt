package com.antigravity.note.library.backup.auth

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DeviceCodeResponse(
    @SerialName("device_code") val deviceCode: String,
    @SerialName("user_code") val userCode: String,
    @SerialName("verification_uri") val verificationUri: String,
    @SerialName("expires_in") val expiresIn: Int = 900,
    @SerialName("interval") val interval: Int = 5
)

@Serializable
data class DeviceTokenResponse(
    @SerialName("access_token") val accessToken: String? = null,
    @SerialName("token_type") val tokenType: String? = null,
    @SerialName("scope") val scope: String? = null,
    @SerialName("error") val error: String? = null,
    @SerialName("error_description") val errorDescription: String? = null
)

@Serializable
data class GitHubUser(
    val login: String,
    val id: Long = 0L,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val name: String? = null,
    val email: String? = null
)

sealed interface AuthState {
    data object SignedOut : AuthState
    data class Authorizing(val userCode: String, val verificationUri: String, val expiresInSeconds: Int) : AuthState
    data class Authenticated(val username: String, val avatarUrl: String?, val token: String) : AuthState
    data class Error(val message: String, val isRecoverable: Boolean = true) : AuthState
    data object ReconnectionRequired : AuthState
}
