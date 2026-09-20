package live.vayusat.alerts.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = false)
data class NotificationPreferences(
    @Json(name = "device_id") val deviceId: String,
    @Json(name = "critical_alerts") val criticalAlerts: Boolean = true,
    @Json(name = "warning_alerts") val warningAlerts: Boolean = true,
    @Json(name = "watch_alerts") val watchAlerts: Boolean = true,
    @Json(name = "info_alerts") val infoAlerts: Boolean = false,
    @Json(name = "test_alerts") val testAlerts: Boolean = false,
    @Json(name = "sound_enabled") val soundEnabled: Boolean = true,
    @Json(name = "vibration_enabled") val vibrationEnabled: Boolean = true,
    @Json(name = "distance_radius_km") val distanceRadiusKm: Double = 250.0,
    @Json(name = "preferred_regions") val preferredRegions: List<String> = emptyList(),
    @Json(name = "updated_at") val updatedAt: String? = null
) {
    val critical_alerts: Boolean get() = criticalAlerts
    val warning_alerts: Boolean get() = warningAlerts
    val watch_alerts: Boolean get() = watchAlerts
    val info_alerts: Boolean get() = infoAlerts
    val sound_enabled: Boolean get() = soundEnabled
    val vibration_enabled: Boolean get() = vibrationEnabled
    val distance_radius_km: Double get() = distanceRadiusKm
    val preferred_regions: List<String> get() = preferredRegions
}

@JsonClass(generateAdapter = false)
data class NotificationPreferencesUpdate(
    @Json(name = "device_id") val device_id: String,
    @Json(name = "critical_alerts") val critical_alerts: Boolean? = null,
    @Json(name = "warning_alerts") val warning_alerts: Boolean? = null,
    @Json(name = "watch_alerts") val watch_alerts: Boolean? = null,
    @Json(name = "info_alerts") val info_alerts: Boolean? = null,
    @Json(name = "sound_enabled") val sound_enabled: Boolean? = null,
    @Json(name = "vibration_enabled") val vibration_enabled: Boolean? = null,
    @Json(name = "distance_radius_km") val distance_radius_km: Double? = null,
    @Json(name = "preferred_regions") val preferred_regions: List<String>? = null
)
