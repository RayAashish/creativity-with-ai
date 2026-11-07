// app/src/main/java/com/raysi/launcher/data/proto/LauncherSettingsSerializer.kt
package com.raysi.launcher.data.proto

import androidx.datastore.core.CorruptionException
import androidx.datastore.core.Serializer
import com.google.protobuf.InvalidProtocolBufferException
import java.io.InputStream
import java.io.OutputStream

/**
 * DataStore serializer for LauncherSettingsProto.
 * Explicitly catches InvalidProtocolBufferException and converts to CorruptionException.
 */
object LauncherSettingsSerializer : Serializer<LauncherSettingsProto> {
    override val defaultValue: LauncherSettingsProto = LauncherSettingsProto.newBuilder()
        .setGateDelaySeconds(10)
        .setSessionDurationMinutes(10)
        .setMaxExtensionsAllowed(2)
        .setScreenTimeIncludesLauncher(true)
        .addAllDigestHours(listOf(12, 18, 21))
        .build()

    override suspend fun readFrom(input: InputStream): LauncherSettingsProto {
        try {
            return LauncherSettingsProto.parseFrom(input)
        } catch (exception: InvalidProtocolBufferException) {
            throw CorruptionException("Cannot read proto buffer stream.", exception)
        }
    }

    override suspend fun writeTo(t: LauncherSettingsProto, output: OutputStream) {
        t.writeTo(output)
    }
}
