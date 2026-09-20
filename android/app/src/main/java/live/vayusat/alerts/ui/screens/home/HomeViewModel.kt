package live.vayusat.alerts.ui.screens.home

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
import live.vayusat.alerts.data.model.RemoteUiBlock
import live.vayusat.alerts.data.model.VayuAlert
import live.vayusat.alerts.data.remote.RemoteConfigService
import live.vayusat.alerts.data.repository.AlertRepository

data class HomeUiState(
    val isLoading: Boolean = false,
    val isOffline: Boolean = false,
    val lastSyncedTime: Long? = null,
    val activeStormName: String? = null,
    val highestSeverity: AlertSeverity = AlertSeverity.INFO,
    val recentAlerts: List<VayuAlert> = emptyList(),
    val uiBlocks: List<RemoteUiBlock> = emptyList(),
    val errorMessage: String? = null
)

class HomeViewModel(
    private val alertRepository: AlertRepository,
    private val remoteConfigService: RemoteConfigService
) : ViewModel() {

    private val _isLoading = MutableStateFlow(false)

    val uiState: StateFlow<HomeUiState> = combine(
        alertRepository.alerts,
        alertRepository.isOffline,
        alertRepository.lastSyncedTime,
        remoteConfigService.config,
        _isLoading
    ) { alerts: List<VayuAlert>, isOffline: Boolean, lastSynced: Long?, config: live.vayusat.alerts.data.model.RemoteConfig, isLoading: Boolean ->
        val activeStorm = alerts.firstOrNull { it.stormName != null }?.stormName ?: "Cyclone ARNAV"
        val highest = alerts.maxByOrNull { it.severity.ordinal }?.severity ?: AlertSeverity.INFO

        HomeUiState(
            isLoading = isLoading,
            isOffline = isOffline,
            lastSyncedTime = lastSynced,
            activeStormName = activeStorm,
            highestSeverity = highest,
            recentAlerts = alerts.take(4),
            uiBlocks = config.uiBlocks.sortedByDescending { it.priority }
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HomeUiState(isLoading = true)
    )

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            alertRepository.refreshAlerts()
            _isLoading.value = false
        }
    }
}
