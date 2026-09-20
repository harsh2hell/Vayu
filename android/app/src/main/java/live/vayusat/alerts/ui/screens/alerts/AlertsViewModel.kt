package live.vayusat.alerts.ui.screens.alerts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.VayuAlert
import live.vayusat.alerts.data.repository.AlertRepository

data class AlertsUiState(
    val isLoading: Boolean = false,
    val selectedSeverity: AlertSeverity? = null,
    val alerts: List<VayuAlert> = emptyList(),
    val isOffline: Boolean = false
)

class AlertsViewModel(
    private val alertRepository: AlertRepository
) : ViewModel() {

    private val _selectedSeverity = MutableStateFlow<AlertSeverity?>(null)
    private val _isLoading = MutableStateFlow(false)

    val uiState: StateFlow<AlertsUiState> = combine(
        alertRepository.alerts,
        _selectedSeverity,
        alertRepository.isOffline,
        _isLoading
    ) { allAlerts, filterSeverity, isOffline, isLoading ->
        val filtered = if (filterSeverity == null) {
            allAlerts
        } else {
            allAlerts.filter { it.severity == filterSeverity }
        }
        AlertsUiState(
            isLoading = isLoading,
            selectedSeverity = filterSeverity,
            alerts = filtered,
            isOffline = isOffline
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = AlertsUiState(isLoading = true)
    )

    fun selectSeverityFilter(severity: AlertSeverity?) {
        _selectedSeverity.value = severity
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            alertRepository.refreshAlerts()
            _isLoading.value = false
        }
    }
}
