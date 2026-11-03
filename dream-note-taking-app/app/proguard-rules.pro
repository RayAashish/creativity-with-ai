# Proguard rules for InkFlow Note App
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# Jetpack Ink native bindings
-keep class androidx.ink.** { *; }

# ProfileInstaller
-dontwarn androidx.profileinstaller.**

# Kotlinx Serialization
-keepattributes *Annotation*,InnerClasses
-dontnote kotlinx.serialization.SerializationKt
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# Room
-keep class * extends androidx.room.RoomDatabase { *; }
-dontwarn androidx.room.paging.**

# WorkManager
-keep class * extends androidx.work.Worker { *; }
-keep class * extends androidx.work.ListenableWorker { *; }

# Security Crypto
-keep class androidx.security.crypto.** { *; }

