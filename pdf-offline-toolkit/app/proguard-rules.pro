# Ledger ProGuard / R8 Rules

# Keep native JNI bindings
-keepclassmembers class * {
    native <methods>;
}

-keep class org.ledger.pdf.engine.NativePdfiumEngine { *; }

# Keep BouncyCastle security providers & algorithms
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# PdfBox-Android rules
-keep class com.tom_roush.pdfbox.** { *; }
-dontwarn com.tom_roush.pdfbox.**
-keep class org.apache.fontbox.** { *; }
-dontwarn org.apache.fontbox.**

# Tesseract 4 Android
-keep class com.googlecode.tesseract.android.** { *; }
-dontwarn com.googlecode.tesseract.android.**

# Room
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**

# WorkManager
-keep class * extends androidx.work.Worker { *; }
-keep class * extends androidx.work.CoroutineWorker { *; }

# Models used in serialization and DB
-keepclassmembers class org.ledger.pdf.data.model.** { *; }
-keepclassmembers class org.ledger.pdf.data.db.** { *; }

# Compose
-keepattributes *Annotation*
