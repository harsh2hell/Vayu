package live.vayusat.alerts

import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.AlertSource
import live.vayusat.alerts.fcm.NotificationPayloadParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class NotificationPayloadParserTest {

    @Test
    fun testValidPayloadParsing() {
        val fcmData = mapOf(
            "alert_id" to "ALR-FCM-100",
            "storm_id" to "STM-2026-04A",
            "storm_name" to "Cyclone ARNAV",
            "severity" to "CRITICAL",
            "title" to "Landfall Threat Warning",
            "message" to "High winds expected on coast.",
            "source" to "VAYU_MODEL",
            "source_module" to "trajectory_gru",
            "region" to "Odisha Coast",
            "latitude" to "19.82",
            "longitude" to "85.82"
        )

        val alert = NotificationPayloadParser.parse(fcmData)
        assertNotNull(alert)
        assertEquals("ALR-FCM-100", alert?.alertId)
        assertEquals("Cyclone ARNAV", alert?.stormName)
        assertEquals(AlertSeverity.CRITICAL, alert?.severity)
        assertEquals("Landfall Threat Warning", alert?.title)
        assertEquals("High winds expected on coast.", alert?.message)
        assertEquals(AlertSource.VAYU_MODEL, alert?.source)
        assertEquals(19.82, alert?.latitude ?: 0.0, 0.001)
        assertEquals(85.82, alert?.longitude ?: 0.0, 0.001)
    }

    @Test
    fun testMissingRequiredFieldsReturnsNull() {
        // Missing alert_id
        val noId = mapOf("title" to "Title", "message" to "Msg")
        assertNull(NotificationPayloadParser.parse(noId))

        // Missing title
        val noTitle = mapOf("alert_id" to "A1", "message" to "Msg")
        assertNull(NotificationPayloadParser.parse(noTitle))

        // Missing message
        val noMessage = mapOf("alert_id" to "A1", "title" to "Title")
        assertNull(NotificationPayloadParser.parse(noMessage))
    }

    @Test
    fun testMalformedCoordinatesFallback() {
        val payload = mapOf(
            "alert_id" to "ALR-COORD-TEST",
            "title" to "Coord Test",
            "message" to "Testing coordinates",
            "latitude" to "invalid-lat",
            "longitude" to "not-a-number"
        )

        val alert = NotificationPayloadParser.parse(payload)
        assertNotNull(alert)
        assertNull(alert?.latitude)
        assertNull(alert?.longitude)
    }
}
