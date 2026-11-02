# Proguard rules for Dream Note App
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# Jetpack Ink native bindings
-keep class androidx.ink.** { *; }

# ProfileInstaller
-dontwarn androidx.profileinstaller.**
