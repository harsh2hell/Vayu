package live.vayusat.alerts.fcm

import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.AlertSource
import live.vayusat.alerts.data.model.VayuAlert
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Parses and validates raw FCM data payload maps into typed [VayuAlert] instances.
 * Provides defensive parsing to prevent app crashes when receiving malformed notifications.
 */
object NotificationPayloadParser {

    private val moshi = Moshi.Builder().build()
    private val mapAdapter = moshi.adapter<Map<String, Any>>(
        Types.newParameterizedType(Map::class.java, String::class.java, Any::class.java)
    )

    fun parse(data: Map<String, String>): VayuAlert? {
        val alertId = data["alert_id"] ?: data["alertId"] ?: return null
        val title = data["title"] ?: return null
        val message = data["message"] ?: data["body"] ?: return null

        val stormId = data["storm_id"] ?: data["stormId"]
        val stormName = data["storm_name"] ?: data["stormName"]
        val severityStr = data["severity"] ?: "INFO"
        val severity = AlertSeverity.fromString(severityStr)

        val sourceStr = data["source"] ?: "VAYU_MODEL"
        val source = AlertSource.fromString(sourceStr)
        val sourceModule = data["source_module"] ?: data["sourceModule"]
        val region = data["region"]

        val latitude = data["latitude"]?.toDoubleOrNull()
        val longitude = data["longitude"]?.toDoubleOrNull()

        val createdAt = data["created_at"] ?: currentIsoTimestamp()
        val expiresAt = data["expires_at"]

        // Parse optional JSON metadata
        val metadata: Map<String, Any> = data["metadata"]?.let { metaJson ->
            try {
                mapAdapter.fromJson(metaJson)
            } catch (_: Exception) {
                null
            }
        } ?: emptyMap()

        return VayuAlert(
            alertId = alertId,
            stormId = stormId,
            stormName = stormName ?: "Cyclone Advisory",
            severity = severity,
            title = title,
            message = message,
            createdAt = createdAt,
            expiresAt = expiresAt,
            source = source,
            sourceModule = sourceModule,
            region = region,
            latitude = latitude,
            longitude = longitude,
            radiusKm = null,
            metadata = metadata,
            isRead = false,
            isAcknowledged = false
        )
    }

    private fun currentIsoTimestamp(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date())
    }
}
