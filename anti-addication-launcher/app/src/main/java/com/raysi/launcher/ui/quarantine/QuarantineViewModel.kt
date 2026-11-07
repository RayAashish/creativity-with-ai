// app/src/main/java/com/raysi/launcher/ui/quarantine/QuarantineViewModel.kt
package com.raysi.launcher.ui.quarantine

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.QuarantineRepository
import com.raysi.launcher.service.notification.NotificationUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class QuarantineItemUi(
    val id: Long,
    val packageName: String,
    val appLabel: String,
    val title: String,
    val text: String,
    val timestamp: Long,
    val timeLabel: String
)

data class QuarantineUiState(
    val items: List<QuarantineItemUi> = emptyList(),
    val isListenerEnabled: Boolean = true,
    val isLoading: Boolean = false
)

class QuarantineViewModel(
    private val quarantineRepository: QuarantineRepository,
    private val appInventoryRepository: AppInventoryRepository,
    private val dispatchers: FocusDispatchers
) : ViewModel() {

    private val _isListenerEnabled = MutableStateFlow(true)
    private val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())

    val uiState: StateFlow<QuarantineUiState> = combine(
        quarantineRepository.allNotificationsFlow,
        appInventoryRepository.appsFlow,
        _isListenerEnabled
    ) { notifications, apps, isListenerEnabled ->
        val labelMap = apps.associate { it.packageName to it.label }
        val items = notifications.map { entity ->
            val label = labelMap[entity.packageName] ?: entity.packageName
            val time = synchronized(timeFormat) {
                timeFormat.format(Date(entity.timestamp))
            }
            QuarantineItemUi(
                id = entity.id,
                packageName = entity.packageName,
                appLabel = label,
                title = entity.title,
                text = entity.text,
                timestamp = entity.timestamp,
                timeLabel = time
            )
        }
        QuarantineUiState(
            items = items,
            isListenerEnabled = isListenerEnabled,
            isLoading = false
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Lazily,
        initialValue = QuarantineUiState(isLoading = true)
    )

    fun checkListenerPermission(context: Context) {
        _isListenerEnabled.value = NotificationUtils.isNotificationListenerEnabled(context)
    }

    fun clearAll() {
        viewModelScope.launch(dispatchers.io) {
            quarantineRepository.clearAll()
        }
    }

    fun deleteItem(id: Long) {
        viewModelScope.launch(dispatchers.io) {
            quarantineRepository.deleteById(id)
        }
    }
}
