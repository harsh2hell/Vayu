package live.vayusat.alerts.data.local

import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.AlertSource
import live.vayusat.alerts.data.model.VayuAlert

/**
 * Local database entity representing cached alerts stored offline on user's device.
 */
data class AlertEntity(
    val alertId: String,
    val stormId: String?,
    val stormName: String?,
    val severity: String,
    val title: String,
    val message: String,
    val createdAt: String,
    val expiresAt: String?,
    val source: String,
    val sourceModule: String?,
    val locationRegion: String?,
    val latitude: Double?,
    val longitude: Double?,
    val radiusKm: Double?,
    val metadataJson: String?,
    val isRead: Boolean = false,
    val isAcknowledged: Boolean = false,
    val cachedAtMillis: Long = System.currentTimeMillis()
) {
    fun toVayuAlert(): VayuAlert {
        return VayuAlert(
            alertId = alertId,
            stormId = stormId,
            stormName = stormName,
            severityCode = severity,
            title = title,
            message = message,
            createdAt = createdAt,
            expiresAt = expiresAt,
            sourceCode = source,
            sourceModule = sourceModule,
            locationRegion = locationRegion,
            latitude = latitude,
            longitude = longitude,
            radiusKm = radiusKm,
            metadata = emptyMap(),
            isRead = isRead,
            isAcknowledged = isAcknowledged
        )
    }

    companion object {
        fun fromVayuAlert(alert: VayuAlert, isRead: Boolean = alert.isRead, isAcknowledged: Boolean = alert.isAcknowledged): AlertEntity {
            return AlertEntity(
                alertId = alert.alertId,
                stormId = alert.stormId,
                stormName = alert.stormName,
                severity = alert.severityCode,
                title = alert.title,
                message = alert.message,
                createdAt = alert.createdAt,
                expiresAt = alert.expiresAt,
                source = alert.sourceCode,
                sourceModule = alert.sourceModule,
                locationRegion = alert.locationRegion,
                latitude = alert.latitude,
                longitude = alert.longitude,
                radiusKm = alert.radiusKm,
                metadataJson = null,
                isRead = isRead,
                isAcknowledged = isAcknowledged
            )
        }
    }
}
