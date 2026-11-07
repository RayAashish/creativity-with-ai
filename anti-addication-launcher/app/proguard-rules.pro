# app/proguard-rules.pro
# FocusLauncher R8 Full Mode Rules

# Protobuf Lite runtime and generated models
-keepclassmembers class * extends com.google.protobuf.GeneratedMessageLite {
    <fields>;
    <methods>;
}
-keep class com.raysi.launcher.data.proto.** { *; }

# Compose Runtime stability
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}

# Keep native methods and classes with native implementations for JNI
-keepclasseswithmembernames class * {
    native <methods>;
}
-keep class com.raysi.launcher.data.search.RustSearchEngine { *; }

# Room Database and DAOs
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# WorkManager Workers
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}
