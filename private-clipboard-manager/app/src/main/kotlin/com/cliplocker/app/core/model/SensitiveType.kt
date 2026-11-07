package com.cliplocker.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class SensitiveType(val label: String, val badge: String) {
    API_KEY(label = "API Key", badge = "KEY"),
    JWT(label = "JSON Web Token", badge = "JWT"),
    PRIVATE_KEY(label = "Private Key", badge = "PEM"),
    CREDIT_CARD(label = "Payment Card", badge = "CARD"),
    PASSWORD(label = "Password", badge = "PWD"),
    NONE(label = "None", badge = "")
}
