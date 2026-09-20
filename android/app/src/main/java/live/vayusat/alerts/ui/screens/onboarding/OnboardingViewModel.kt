package live.vayusat.alerts.ui.screens.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import live.vayusat.alerts.data.repository.DeviceRepository

class OnboardingViewModel(
    private val deviceRepository: DeviceRepository
) : ViewModel() {

    private val _notificationGranted = MutableStateFlow(false)
    val notificationGranted: StateFlow<Boolean> = _notificationGranted.asStateFlow()

    private val _locationGranted = MutableStateFlow(false)
    val locationGranted: StateFlow<Boolean> = _locationGranted.asStateFlow()

    fun updateNotificationPermission(granted: Boolean) {
        _notificationGranted.value = granted
    }

    fun updateLocationPermission(granted: Boolean) {
        _locationGranted.value = granted
    }

    fun completeOnboarding(onFinished: () -> Unit) {
        viewModelScope.launch {
            deviceRepository.setOnboardingCompleted(true)
            onFinished()
        }
    }
}
