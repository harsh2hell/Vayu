package live.vayusat.alerts

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.AlertSource
import live.vayusat.alerts.data.model.VayuAlert
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AlertModelTest {

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    @Test
    fun testAlertSerializationAndDeserialization() {
        val adapter = moshi.adapter(VayuAlert::class.java)

        val alert = VayuAlert(
            alertId = "ALR-2026-00042",
            stormId = "STM-2026-04A",
            stormName = "Cyclone DANA",
            severity = AlertSeverity.CRITICAL,
            title = "Landfall Impending Advisory",
            message = "Cyclone eye landfall anticipated within 6 hours near Dhamra port.",
            createdAt = "2026-09-20T12:00:00Z",
            expiresAt = "2026-09-21T18:00:00Z",
            source = AlertSource.VAYU_MODEL,
            sourceModule = "trajectory_gru",
            region = "Odisha Coast",
            latitude = 20.8,
            longitude = 86.9,
            metadata = mapOf("wind_knots" to 75.0, "category" to "VSCS"),
            isRead = false,
            isAcknowledged = false
        )

        val json = adapter.toJson(alert)
        assertNotNull(json)
        assertTrue(json.contains("ALR-2026-00042"))
        assertTrue(json.contains("CRITICAL"))

        val deserialized = adapter.fromJson(json)
        assertNotNull(deserialized)
        assertEquals(alert.alertId, deserialized?.alertId)
        assertEquals(alert.stormName, deserialized?.stormName)
        assertEquals(AlertSeverity.CRITICAL, deserialized?.severity)
        assertEquals(alert.latitude, deserialized?.latitude)
    }

    @Test
    fun testAlertExpirationCheck() {
        val expiredAlert = VayuAlert(
            alertId = "ALR-EXPIRED",
            title = "Old Alert",
            message = "Expired message",
            createdAt = "2020-01-01T00:00:00Z",
            expiresAt = "2020-01-02T00:00:00Z"
        )
        assertTrue(expiredAlert.isExpired())

        val futureAlert = VayuAlert(
            alertId = "ALR-FUTURE",
            title = "Active Alert",
            message = "Valid message",
            createdAt = "2026-01-01T00:00:00Z",
            expiresAt = "2030-01-01T00:00:00Z"
        )
        assertFalse(futureAlert.isExpired())

        val noExpiryAlert = VayuAlert(
            alertId = "ALR-NO-EXPIRY",
            title = "Indefinite Alert",
            message = "Valid message",
            createdAt = "2026-01-01T00:00:00Z",
            expiresAt = null
        )
        assertFalse(noExpiryAlert.isExpired())
    }
}
