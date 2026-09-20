package live.vayusat.alerts.ui.screens.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import live.vayusat.alerts.data.model.VayuAlert
import live.vayusat.alerts.data.repository.AlertRepository

data class TrackWaypoint(
    val hourOffset: Int,
    val latitude: Double,
    val longitude: Double,
    val windKnots: Int,
    val label: String
)

data class MapUiState(
    val stormName: String = "Cyclone ARNAV",
    val stormCategory: String = "Very Severe Cyclonic Storm",
    val currentLat: Double = 16.4,
    val currentLon: Double = 86.8,
    val currentWindKnots: Int = 75,
    val heading: String = "NNW at 14 km/h",
    val uncertaintyRadiusKm: Double = 45.0,
    val waypoints: List<TrackWaypoint> = listOf(
        TrackWaypoint(0, 16.4, 86.8, 75, "Now (Eye)"),
        TrackWaypoint(6, 17.1, 86.5, 78, "+6h"),
        TrackWaypoint(12, 17.9, 86.1, 80, "+12h"),
        TrackWaypoint(18, 18.7, 85.8, 82, "+18h"),
        TrackWaypoint(24, 19.5, 85.4, 76, "+24h (Landfall)")
    )
)

class MapViewModel(
    private val alertRepository: AlertRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MapUiState())
    val uiState: StateFlow<MapUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            alertRepository.alerts.collect { alerts ->
                val active = alerts.firstOrNull { it.latitude != null && it.longitude != null }
                if (active != null) {
                    _uiState.value = _uiState.value.copy(
                        stormName = active.stormName ?: "Active Cyclone",
                        currentLat = active.latitude ?: 16.4,
                        currentLon = active.longitude ?: 86.8
                    )
                }
            }
        }
    }
}
