package live.vayusat.alerts.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import live.vayusat.alerts.data.model.NotificationPreferences
import live.vayusat.alerts.data.repository.DeviceRepository

class SettingsViewModel(
    private val deviceRepository: DeviceRepository
) : ViewModel() {

    val preferences: StateFlow<NotificationPreferences> = deviceRepository.preferences
    val fcmToken: StateFlow<String?> = deviceRepository.fcmToken
    val deviceId: String = deviceRepository.deviceId

    fun toggleCritical(enabled: Boolean) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(criticalEnabled = enabled)
        }
    }

    fun toggleWarning(enabled: Boolean) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(warningEnabled = enabled)
        }
    }

    fun toggleWatch(enabled: Boolean) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(watchEnabled = enabled)
        }
    }

    fun toggleInfo(enabled: Boolean) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(infoEnabled = enabled)
        }
    }

    fun toggleSound(enabled: Boolean) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(soundEnabled = enabled)
        }
    }

    fun toggleVibration(enabled: Boolean) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(vibrationEnabled = enabled)
        }
    }

    fun updateRadius(radiusKm: Double) {
        viewModelScope.launch {
            deviceRepository.updateNotificationPreferences(radiusKm = radiusKm)
        }
    }
}
