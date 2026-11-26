# R8 Full Mode Rules for Anchor

# Room entities and database constructors
-keep class com.raysi.anchor.data.db.** { *; }

# Keep Extractor classes if inspected via reflection or plugin registry
-keep class * implements com.raysi.anchor.extractor.PlatformExtractor

# OkHttp 5 / Okio optional runtime annotations
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.**

# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule { <init>(...); }

# Media3 ExoPlayer
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**
