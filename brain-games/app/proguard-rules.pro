# MindForge ProGuard / R8 rules

# Keep DataStore and Room generated classes
-keepclassmembers class * extends androidx.room.RoomDatabase {
    <init>();
}

# Keep Kotlinx Serialization models
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.SerializationKt

# Keep ViewModel constructors for Hilt
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>(...);
}
