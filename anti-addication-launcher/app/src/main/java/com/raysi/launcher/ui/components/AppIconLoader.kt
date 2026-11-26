// app/src/main/java/com/raysi/launcher/ui/components/AppIconLoader.kt
package com.raysi.launcher.ui.components

import android.content.ComponentName
import android.content.Context
import android.content.pm.LauncherApps
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.AdaptiveIconDrawable
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Process
import android.os.UserHandle
import android.util.LruCache
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.domain.model.AppIconMode
import com.raysi.launcher.ui.theme.PureWhite
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Memory-bounded LRU cache for application icons decoded off the main thread.
 * Supports adaptive icons, multi-user badging, and grayscale ColorMatrix filtering.
 */
object AppIconCache {
    private val cache = object : LruCache<String, ImageBitmap>(256) {}

    val monochromeFilter: ColorFilter by lazy {
        val matrix = ColorMatrix().apply { setToSaturation(0f) }
        ColorFilter.colorMatrix(matrix)
    }

    suspend fun loadIcon(
        context: Context,
        packageName: String,
        className: String,
        userHandle: UserHandle? = null,
        sizePx: Int = 128
    ): ImageBitmap? {
        val key = "$packageName/$className#${userHandle?.hashCode() ?: 0}"
        cache.get(key)?.let { return it }

        return withContext(Dispatchers.Default) {
            cache.get(key)?.let { return@withContext it }
            val drawable = resolveDrawable(context, packageName, className, userHandle) ?: return@withContext null
            val bitmap = drawableToBitmap(drawable, sizePx) ?: return@withContext null
            val imageBitmap = bitmap.asImageBitmap()
            cache.put(key, imageBitmap)
            imageBitmap
        }
    }

    private fun resolveDrawable(
        context: Context,
        packageName: String,
        className: String,
        userHandle: UserHandle?
    ): Drawable? {
        val pm = context.packageManager
        val targetUser = userHandle ?: Process.myUserHandle()
        val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as? LauncherApps

        // Prefer LauncherApps badged icon (proper adaptive icon & work badge support)
        if (launcherApps != null && className.isNotEmpty()) {
            try {
                val activities = launcherApps.getActivityList(packageName, targetUser)
                val match = activities.firstOrNull { it.componentName.className == className }
                    ?: activities.firstOrNull()
                if (match != null) {
                    return match.getBadgedIcon(0)
                }
            } catch (_: Exception) {}
        }

        if (className.isNotEmpty()) {
            try {
                val raw = pm.getActivityIcon(ComponentName(packageName, className))
                return if (userHandle != null && userHandle != Process.myUserHandle()) {
                    pm.getUserBadgedIcon(raw, userHandle)
                } else raw
            } catch (_: Exception) {}
        }

        return try {
            val raw = pm.getApplicationIcon(packageName)
            if (userHandle != null && userHandle != Process.myUserHandle()) {
                pm.getUserBadgedIcon(raw, userHandle)
            } else raw
        } catch (_: Exception) {
            null
        }
    }

    private fun drawableToBitmap(drawable: Drawable, sizePx: Int): Bitmap? {
        return try {
            if (drawable is BitmapDrawable && drawable.bitmap != null) {
                val src = drawable.bitmap
                if (src.width == sizePx && src.height == sizePx) {
                    return src
                }
            }
            val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            if (drawable is AdaptiveIconDrawable) {
                drawable.setBounds(0, 0, sizePx, sizePx)
                drawable.draw(canvas)
            } else {
                drawable.setBounds(0, 0, sizePx, sizePx)
                drawable.draw(canvas)
            }
            bitmap
        } catch (_: Exception) {
            null
        }
    }
}

/**
 * Displays a crisp, hardware-friendly app icon in either REAL or MONOCHROME style.
 * Falls back cleanly to a minimal monospaced letter tile while decoding or when unresolvable.
 */
@Composable
fun AppIconImage(
    packageName: String,
    className: String,
    label: String,
    iconMode: AppIconMode,
    userHandle: UserHandle? = null,
    size: Dp = 40.dp,
    alpha: Float = 1f,
    isSatiated: Boolean = false,
    modifier: Modifier = Modifier
) {
    if (iconMode == AppIconMode.TEXT_ONLY) return

    val context = LocalContext.current
    val cacheKey = "$packageName/$className"
    val bitmap by produceState<ImageBitmap?>(initialValue = null, key1 = cacheKey) {
        value = AppIconCache.loadIcon(context, packageName, className, userHandle, 128)
    }

    val shape = RoundedCornerShape(size * 0.28f)
    val filter = if (iconMode == AppIconMode.MONOCHROME || isSatiated) {
        AppIconCache.monochromeFilter
    } else null

    val resolvedBitmap = bitmap
    if (resolvedBitmap != null) {
        Image(
            bitmap = resolvedBitmap,
            contentDescription = label,
            contentScale = ContentScale.Crop,
            colorFilter = filter,
            modifier = modifier
                .size(size)
                .clip(shape)
                .alpha(alpha)
        )
    } else {
        // Fallback minimal initial tile
        Box(
            modifier = modifier
                .size(size)
                .clip(shape)
                .background(Color(0xFF161616))
                .alpha(alpha),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = label.firstOrNull()?.uppercaseChar()?.toString() ?: "?",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Medium,
                fontSize = (size.value * 0.42f).sp,
                color = PureWhite
            )
        }
    }
}
