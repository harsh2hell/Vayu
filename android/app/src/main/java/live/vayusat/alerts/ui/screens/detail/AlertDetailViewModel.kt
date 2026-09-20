package live.vayusat.alerts.ui.screens.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import live.vayusat.alerts.data.model.VayuAlert
import live.vayusat.alerts.data.repository.AlertRepository

data class AlertDetailUiState(
    val isLoading: Boolean = true,
    val alert: VayuAlert? = null,
    val errorMessage: String? = null
)

class AlertDetailViewModel(
    private val alertRepository: AlertRepository,
    private val alertId: String
) : ViewModel() {

    private val _uiState = MutableStateFlow(AlertDetailUiState())
    val uiState: StateFlow<AlertDetailUiState> = _uiState.asStateFlow()

    init {
        loadAlert()
    }

    private fun loadAlert() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val alert = alertRepository.getAlertById(alertId)
            if (alert != null) {
                alertRepository.markAlertAsRead(alertId)
                _uiState.value = AlertDetailUiState(isLoading = false, alert = alert)
            } else {
                _uiState.value = AlertDetailUiState(
                    isLoading = false,
                    errorMessage = "Advisory $alertId could not be located."
                )
            }
        }
    }

    fun acknowledge() {
        viewModelScope.launch {
            alertRepository.acknowledgeAlert(alertId)
            val updated = alertRepository.getAlertById(alertId)
            _uiState.value = _uiState.value.copy(alert = updated)
        }
    }
}
