package live.vayusat.alerts.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = false)
data class DeviceRegistrationRequest(
    @Json(name = "device_id") val deviceId: String,
    @Json(name = "fcm_token") val fcmToken: String,
    @Json(name = "platform") val platform: String = "android",
    @Json(name = "app_version") val appVersion: String? = "1.0.0",
    @Json(name = "os_version") val osVersion: String? = null,
    @Json(name = "device_model") val deviceModel: String? = null,
    @Json(name = "locale") val locale: String? = "en_IN",
    @Json(name = "latitude") val latitude: Double? = null,
    @Json(name = "longitude") val longitude: Double? = null,
    @Json(name = "district") val district: String? = null,
    @Json(name = "state") val state: String? = null
) {
    constructor(
        fcm_token: String,
        device_id: String,
        platform: String = "android",
        app_version: String? = "1.0.0",
        os_version: String? = null,
        device_model: String? = null,
        locale: String? = "en_IN"
    ) : this(
        deviceId = device_id,
        fcmToken = fcm_token,
        platform = platform,
        appVersion = app_version,
        osVersion = os_version,
        deviceModel = device_model,
        locale = locale
    )

    val fcm_token: String get() = fcmToken
    val device_id: String get() = deviceId
}

@JsonClass(generateAdapter = false)
data class DeviceRegistrationResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "device_id") val deviceId: String,
    @Json(name = "status") val status: String,
    @Json(name = "message") val message: String? = null
)
