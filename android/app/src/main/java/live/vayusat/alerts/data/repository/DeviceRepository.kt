package live.vayusat.alerts.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import live.vayusat.alerts.data.model.DeviceRegistrationRequest
import live.vayusat.alerts.data.model.NotificationPreferences
import live.vayusat.alerts.data.model.NotificationPreferencesUpdate
import live.vayusat.alerts.data.remote.VayuApiService
import java.util.UUID

/**
 * Repository responsible for device registration with the VAYU backend,
 * FCM token updates, and notification preference synchronization.
 */
class DeviceRepository(
    context: Context,
    private val apiService: VayuApiService
) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _preferences = MutableStateFlow(loadLocalPreferences())
    val preferences: StateFlow<NotificationPreferences> = _preferences.asStateFlow()

    private val _fcmToken = MutableStateFlow(prefs.getString(KEY_FCM_TOKEN, null))
    val fcmToken: StateFlow<String?> = _fcmToken.asStateFlow()

    val deviceId: String
        get() {
            var id = prefs.getString(KEY_DEVICE_ID, null)
            if (id == null) {
                id = UUID.randomUUID().toString()
                prefs.edit().putString(KEY_DEVICE_ID, id).apply()
            }
            return id
        }

    fun isOnboardingCompleted(): Boolean = prefs.getBoolean(KEY_ONBOARDING_COMPLETED, false)

    fun setOnboardingCompleted(completed: Boolean) {
        prefs.edit().putBoolean(KEY_ONBOARDING_COMPLETED, completed).apply()
    }

    private val _isBackendConnected = MutableStateFlow(true)
    val isBackendConnected: StateFlow<Boolean> = _isBackendConnected.asStateFlow()

    val lastTokenSync: String
        get() = prefs.getString(KEY_LAST_SYNC, "Pending initial sync") ?: "Pending initial sync"

    suspend fun saveAndRegisterFcmToken(token: String): Result<Boolean> = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply()
        _fcmToken.value = token

        val request = DeviceRegistrationRequest(
            fcm_token = token,
            device_id = deviceId,
            platform = "android",
            app_version = "10.0.0",
            os_version = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})",
            device_model = "${Build.MANUFACTURER} ${Build.MODEL}",
            locale = "en-IN"
        )

        val result = apiService.registerDevice(request)
        if (result.isSuccess) {
            val nowFormatted = java.text.SimpleDateFormat("dd MMM yyyy, HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())
            prefs.edit().putString(KEY_LAST_SYNC, nowFormatted).apply()
            _isBackendConnected.value = true
            Result.success(true)
        } else {
            _isBackendConnected.value = false
            Result.failure(result.exceptionOrNull() ?: Exception("Failed to register device token"))
        }
    }

    suspend fun updateNotificationPreferences(
        criticalEnabled: Boolean? = null,
        warningEnabled: Boolean? = null,
        watchEnabled: Boolean? = null,
        infoEnabled: Boolean? = null,
        soundEnabled: Boolean? = null,
        vibrationEnabled: Boolean? = null,
        radiusKm: Double? = null,
        preferredRegions: List<String>? = null
    ): Result<NotificationPreferences> = withContext(Dispatchers.IO) {
        val update = NotificationPreferencesUpdate(
            device_id = deviceId,
            critical_alerts = criticalEnabled,
            warning_alerts = warningEnabled,
            watch_alerts = watchEnabled,
            info_alerts = infoEnabled,
            sound_enabled = soundEnabled,
            vibration_enabled = vibrationEnabled,
            distance_radius_km = radiusKm,
            preferred_regions = preferredRegions
        )

        val current = _preferences.value
        val updated = current.copy(
            criticalAlerts = criticalEnabled ?: current.criticalAlerts,
            warningAlerts = warningEnabled ?: current.warningAlerts,
            watchAlerts = watchEnabled ?: current.watchAlerts,
            infoAlerts = infoEnabled ?: current.infoAlerts,
            soundEnabled = soundEnabled ?: current.soundEnabled,
            vibrationEnabled = vibrationEnabled ?: current.vibrationEnabled,
            distanceRadiusKm = radiusKm ?: current.distanceRadiusKm,
            preferredRegions = preferredRegions ?: current.preferredRegions
        )

        saveLocalPreferences(updated)
        _preferences.value = updated

        // Attempt remote update
        val remoteResult = apiService.updatePreferences(update)
        if (remoteResult.isSuccess) {
            remoteResult.getOrNull()?.let {
                _preferences.value = it
                saveLocalPreferences(it)
            }
            Result.success(_preferences.value)
        } else {
            // Saved locally, will sync when backend is reachable
            Result.success(updated)
        }
    }

    private fun loadLocalPreferences(): NotificationPreferences {
        return NotificationPreferences(
            deviceId = deviceId,
            criticalAlerts = prefs.getBoolean(KEY_CRITICAL, true),
            warningAlerts = prefs.getBoolean(KEY_WARNING, true),
            watchAlerts = prefs.getBoolean(KEY_WATCH, true),
            infoAlerts = prefs.getBoolean(KEY_INFO, false),
            soundEnabled = prefs.getBoolean(KEY_SOUND, true),
            vibrationEnabled = prefs.getBoolean(KEY_VIBRATION, true),
            distanceRadiusKm = prefs.getFloat(KEY_RADIUS, 250f).toDouble(),
            preferredRegions = prefs.getStringSet(KEY_REGIONS, emptySet())?.toList() ?: emptyList()
        )
    }

    private fun saveLocalPreferences(pref: NotificationPreferences) {
        prefs.edit()
            .putBoolean(KEY_CRITICAL, pref.criticalAlerts)
            .putBoolean(KEY_WARNING, pref.warningAlerts)
            .putBoolean(KEY_WATCH, pref.watchAlerts)
            .putBoolean(KEY_INFO, pref.infoAlerts)
            .putBoolean(KEY_SOUND, pref.soundEnabled)
            .putBoolean(KEY_VIBRATION, pref.vibrationEnabled)
            .putFloat(KEY_RADIUS, pref.distanceRadiusKm.toFloat())
            .putStringSet(KEY_REGIONS, pref.preferredRegions.toSet())
            .apply()
    }

    companion object {
        private const val PREFS_NAME = "vayu_device_prefs"
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_FCM_TOKEN = "fcm_token"
        private const val KEY_ONBOARDING_COMPLETED = "onboarding_completed"
        private const val KEY_LAST_SYNC = "last_token_sync"
        private const val KEY_CRITICAL = "pref_critical"
        private const val KEY_WARNING = "pref_warning"
        private const val KEY_WATCH = "pref_watch"
        private const val KEY_INFO = "pref_info"
        private const val KEY_SOUND = "pref_sound"
        private const val KEY_VIBRATION = "pref_vibration"
        private const val KEY_RADIUS = "pref_radius"
        private const val KEY_REGIONS = "pref_regions"
    }
}
