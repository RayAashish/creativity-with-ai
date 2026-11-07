// app/src/main/java/com/raysi/launcher/data/repository/AppInventoryRepository.kt
package com.raysi.launcher.data.repository

import android.app.role.RoleManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.LauncherActivityInfo
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.Process
import android.os.UserHandle
import android.os.UserManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.AppInfo
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.Closeable
import java.text.Collator
import java.util.Locale

interface AppInventoryRepository {
    val appsFlow: StateFlow<List<AppInfo>>
    val appsMapFlow: StateFlow<Map<String, AppInfo>>
    suspend fun reloadInventory()
    fun launchApp(componentName: ComponentName, userHandle: UserHandle, sourceBounds: Rect? = null): Boolean
    fun launchApp(appInfo: AppInfo, sourceBounds: Rect? = null): Boolean
    fun findApp(componentNameStr: String, userSerialNumber: Long): AppInfo?
    fun getUserHandle(userSerialNumber: Long): UserHandle?
    fun getUserSerialNumber(userHandle: UserHandle): Long
    fun isDefaultLauncher(): Boolean
    fun createDefaultLauncherIntent(): Intent
}

class AppInventoryRepositoryImpl(
    private val context: Context,
    private val dispatchers: FocusDispatchers
) : AppInventoryRepository, Closeable {

    private val scope = CoroutineScope(SupervisorJob() + dispatchers.default)
    private val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as? LauncherApps
    private val userManager = context.getSystemService(Context.USER_SERVICE) as? UserManager
    private val roleManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        context.getSystemService(RoleManager::class.java)
    } else {
        null
    }

    private val collator = Collator.getInstance(Locale.getDefault()).apply {
        strength = Collator.PRIMARY
    }

    private val _appsFlow = MutableStateFlow<List<AppInfo>>(emptyList())
    override val appsFlow: StateFlow<List<AppInfo>> = _appsFlow.asStateFlow()

    private val _appsMapFlow = MutableStateFlow<Map<String, AppInfo>>(emptyMap())
    override val appsMapFlow: StateFlow<Map<String, AppInfo>> = _appsMapFlow.asStateFlow()

    private val backgroundThread = HandlerThread("focus-launcher-apps-cb").apply { start() }
    private val backgroundHandler = Handler(backgroundThread.looper)

    private val launcherCallback = object : LauncherApps.Callback() {
        override fun onPackageAdded(packageName: String, user: UserHandle) {
            triggerAsyncReload()
        }

        override fun onPackageRemoved(packageName: String, user: UserHandle) {
            triggerAsyncReload()
        }

        override fun onPackageChanged(packageName: String, user: UserHandle) {
            triggerAsyncReload()
        }

        override fun onPackagesAvailable(packageNames: Array<out String>, user: UserHandle, replacing: Boolean) {
            triggerAsyncReload()
        }

        override fun onPackagesUnavailable(packageNames: Array<out String>, user: UserHandle, replacing: Boolean) {
            triggerAsyncReload()
        }
    }

    private val packageBroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(receiverContext: Context?, intent: Intent?) {
            triggerAsyncReload()
        }
    }

    init {
        // Register LauncherApps callback
        try {
            launcherApps?.registerCallback(launcherCallback, backgroundHandler)
        } catch (ignored: Exception) {
        }

        // Register package broadcast receiver as fallback for package install/uninstall
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_PACKAGE_ADDED)
            addAction(Intent.ACTION_PACKAGE_REMOVED)
            addAction(Intent.ACTION_PACKAGE_CHANGED)
            addAction(Intent.ACTION_PACKAGE_REPLACED)
            addDataScheme("package")
        }
        try {
            ContextCompat.registerReceiver(
                context,
                packageBroadcastReceiver,
                filter,
                ContextCompat.RECEIVER_EXPORTED
            )
        } catch (ignored: Exception) {
        }

        // Initial enumeration off the main thread
        triggerAsyncReload()
    }

    private fun triggerAsyncReload() {
        scope.launch {
            reloadInventory()
        }
    }

    override suspend fun reloadInventory() = withContext(dispatchers.default) {
        if (launcherApps == null || userManager == null) {
            return@withContext
        }

        val myUserHandle = Process.myUserHandle()
        val ownPackageName = context.packageName
        val userProfiles: List<UserHandle> = try {
            userManager.userProfiles ?: listOf(myUserHandle)
        } catch (e: Exception) {
            listOf(myUserHandle)
        }

        val rawAppList = ArrayList<AppInfo>(256)

        for (user in userProfiles) {
            val userSerialNumber = try {
                userManager.getSerialNumberForUser(user)
            } catch (e: Exception) {
                0L
            }

            val isWorkProfile = user != myUserHandle

            val activities: List<LauncherActivityInfo> = try {
                launcherApps.getActivityList(null, user) ?: emptyList()
            } catch (e: SecurityException) {
                emptyList()
            } catch (e: Exception) {
                emptyList()
            }

            for (activity in activities) {
                val component = activity.componentName
                if (component.packageName == ownPackageName) {
                    continue // Exclude FocusLauncher from its own launcher inventory
                }

                val rawLabel = try {
                    activity.label?.toString()?.trim()
                } catch (e: Exception) {
                    null
                }
                val cleanLabel = if (!rawLabel.isNullOrBlank()) {
                    rawLabel
                } else {
                    component.packageName
                }

                val appCategory = try {
                    activity.applicationInfo.category
                } catch (e: Exception) {
                    -1
                }

                rawAppList.add(
                    AppInfo(
                        componentName = component,
                        userHandle = user,
                        label = cleanLabel,
                        packageName = component.packageName,
                        className = component.className,
                        userSerialNumber = userSerialNumber,
                        isWorkProfile = isWorkProfile,
                        category = appCategory
                    )
                )
            }
        }

        // Sort alphabetically by label using locale-aware collator
        rawAppList.sortWith { a, b ->
            val result = collator.compare(a.label, b.label)
            if (result != 0) result else a.uniqueKey.compareTo(b.uniqueKey)
        }

        val map = HashMap<String, AppInfo>(rawAppList.size * 4 / 3 + 1)
        for (app in rawAppList) {
            map[app.uniqueKey] = app
        }

        // Atomically swap the index
        _appsMapFlow.value = map
        _appsFlow.value = rawAppList
    }

    override fun launchApp(componentName: ComponentName, userHandle: UserHandle, sourceBounds: Rect?): Boolean {
        if (launcherApps == null) return false
        return try {
            launcherApps.startMainActivity(componentName, userHandle, sourceBounds, null)
            true
        } catch (e: Exception) {
            false
        }
    }

    override fun launchApp(appInfo: AppInfo, sourceBounds: Rect?): Boolean {
        val comp = appInfo.componentName ?: return false
        val user = appInfo.userHandle ?: return false
        return launchApp(comp, user, sourceBounds)
    }

    override fun findApp(componentNameStr: String, userSerialNumber: Long): AppInfo? {
        val uniqueKey = "$componentNameStr#$userSerialNumber"
        return _appsMapFlow.value[uniqueKey]
    }

    override fun getUserHandle(userSerialNumber: Long): UserHandle? {
        if (userManager == null) return null
        return try {
            userManager.getUserForSerialNumber(userSerialNumber)
        } catch (e: Exception) {
            null
        }
    }

    override fun getUserSerialNumber(userHandle: UserHandle): Long {
        if (userManager == null) return 0L
        return try {
            userManager.getSerialNumberForUser(userHandle)
        } catch (e: Exception) {
            0L
        }
    }

    override fun isDefaultLauncher(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && roleManager != null) {
            try {
                roleManager.isRoleHeld(RoleManager.ROLE_HOME)
            } catch (e: Exception) {
                false
            }
        } else {
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
            }
            val resolveInfo = context.packageManager.resolveActivity(
                intent,
                PackageManager.MATCH_DEFAULT_ONLY
            )
            resolveInfo?.activityInfo?.packageName == context.packageName
        }
    }

    override fun createDefaultLauncherIntent(): Intent {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && roleManager != null) {
            try {
                roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME)
            } catch (e: Exception) {
                Intent(Settings.ACTION_HOME_SETTINGS)
            }
        } else {
            Intent(Settings.ACTION_HOME_SETTINGS)
        }
    }

    override fun close() {
        try {
            launcherApps?.unregisterCallback(launcherCallback)
        } catch (ignored: Exception) {
        }
        try {
            context.unregisterReceiver(packageBroadcastReceiver)
        } catch (ignored: Exception) {
        }
        backgroundThread.quitSafely()
    }
}
