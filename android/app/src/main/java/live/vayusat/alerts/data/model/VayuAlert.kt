package live.vayusat.alerts.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Authoritative VAYU Alert Data Model.
 * Represents a discrete, spatiotemporally referenced cyclone risk alert.
 */
@JsonClass(generateAdapter = false)
data class VayuAlert(
    @Json(name = "alert_id") val alertId: String,
    @Json(name = "storm_id") val stormId: String? = null,
    @Json(name = "storm_name") val stormName: String? = "Cyclone Advisory",
    @Json(name = "severity") val severityCode: String = "INFO",
    @Json(name = "title") val title: String,
    @Json(name = "message") val message: String,
    @Json(name = "created_at") val createdAt: String = defaultTimestamp(),
    @Json(name = "expires_at") val expiresAt: String? = null,
    @Json(name = "source") val sourceCode: String = "VAYU_MODEL",
    @Json(name = "source_module") val sourceModule: String? = null,
    @Json(name = "location_region") val locationRegion: String? = null,
    @Json(name = "latitude") val latitude: Double? = null,
    @Json(name = "longitude") val longitude: Double? = null,
    @Json(name = "radius_km") val radiusKm: Double? = null,
    @Json(name = "metadata") val metadata: Map<String, Any?>? = emptyMap(),
    val isRead: Boolean = false,
    val isAcknowledged: Boolean = false
) {
    // Secondary constructor accepting typed Enums
    constructor(
        alertId: String,
        stormId: String? = null,
        stormName: String? = "Cyclone Advisory",
        severity: AlertSeverity,
        title: String,
        message: String,
        createdAt: String = defaultTimestamp(),
        expiresAt: String? = null,
        source: AlertSource = AlertSource.VAYU_MODEL,
        sourceModule: String? = null,
        region: String? = null,
        latitude: Double? = null,
        longitude: Double? = null,
        radiusKm: Double? = null,
        metadata: Map<String, Any?>? = emptyMap(),
        isRead: Boolean = false,
        isAcknowledged: Boolean = false
    ) : this(
        alertId = alertId,
        stormId = stormId,
        stormName = stormName,
        severityCode = severity.name,
        title = title,
        message = message,
        createdAt = createdAt,
        expiresAt = expiresAt,
        sourceCode = source.name,
        sourceModule = sourceModule,
        locationRegion = region,
        latitude = latitude,
        longitude = longitude,
        radiusKm = radiusKm,
        metadata = metadata,
        isRead = isRead,
        isAcknowledged = isAcknowledged
    )

    val severity: AlertSeverity
        get() = AlertSeverity.fromString(severityCode)

    val source: AlertSource
        get() = AlertSource.fromString(sourceCode)

    val region: String?
        get() = locationRegion

    val hasCoordinates: Boolean
        get() = latitude != null && longitude != null

    /**
     * Checks if this alert has expired relative to device clock.
     */
    fun isExpired(): Boolean {
        if (expiresAt.isNullOrBlank()) return false
        return try {
            val clean = expiresAt.replace(" ", "T")
            val expiresInstant = java.time.Instant.parse(
                if (clean.endsWith("Z") || clean.contains("+")) clean else clean + "Z"
            )
            java.time.Instant.now().isAfter(expiresInstant)
        } catch (_: Exception) {
            false
        }
    }

    companion object {
        private fun defaultTimestamp(): String {
            val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
            sdf.timeZone = TimeZone.getTimeZone("UTC")
            return sdf.format(Date())
        }
    }
}
