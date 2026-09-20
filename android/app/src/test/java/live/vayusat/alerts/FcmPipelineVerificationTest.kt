package live.vayusat.alerts

import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.AlertSource
import live.vayusat.alerts.fcm.NotificationChannelManager
import live.vayusat.alerts.fcm.NotificationPayloadParser
import live.vayusat.alerts.util.DeepLinkHandler
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Phase 10B Automated Tests:
 * - FCM payload parsing
 * - Notification channel selection
 * - Deep-link handling
 * - Alert ID extraction
 * - Notification tap target verification
 */
class FcmPipelineVerificationTest {

    @Test
    fun testTestAlertPayloadParsing() {
        val fcmData = mapOf(
            "alert_id" to "ALR-2026-TEST-001",
            "storm_id" to "STM-TEST",
            "storm_name" to "Cyclone Test",
            "severity" to "TEST",
            "title" to "🧪 VAYU TEST ALERT",
            "message" to "Notification pipeline is operational.",
            "source" to "VAYU_OPERATOR",
            "deep_link" to "vayu://alert/ALR-2026-TEST-001"
        )

        val alert = NotificationPayloadParser.parse(fcmData)
        assertNotNull("Alert must be parsed from valid FCM payload", alert)
        assertEquals("ALR-2026-TEST-001", alert?.alertId)
        assertEquals("Cyclone Test", alert?.stormName)
        assertEquals(AlertSeverity.TEST, alert?.severity)
        assertEquals("🧪 VAYU TEST ALERT", alert?.title)
        assertEquals("Notification pipeline is operational.", alert?.message)
    }

    @Test
    fun testNotificationChannelSelection() {
        assertEquals(
            NotificationChannelManager.CHANNEL_TEST,
            NotificationChannelManager.getChannelIdForSeverity("TEST")
        )
        assertEquals(
            NotificationChannelManager.CHANNEL_CRITICAL,
            NotificationChannelManager.getChannelIdForSeverity("CRITICAL")
        )
        assertEquals(
            NotificationChannelManager.CHANNEL_WARNING,
            NotificationChannelManager.getChannelIdForSeverity("WARNING")
        )
        assertEquals(
            NotificationChannelManager.CHANNEL_WATCH,
            NotificationChannelManager.getChannelIdForSeverity("WATCH")
        )
        assertEquals(
            NotificationChannelManager.CHANNEL_INFORMATION,
            NotificationChannelManager.getChannelIdForSeverity("INFORMATION")
        )
        assertEquals(
            NotificationChannelManager.CHANNEL_INFORMATION,
            NotificationChannelManager.getChannelIdForSeverity("INFO")
        )
        // Fallback channel for unknown severity
        assertEquals(
            NotificationChannelManager.CHANNEL_WATCH,
            NotificationChannelManager.getChannelIdForSeverity("UNKNOWN_LEVEL")
        )
    }

    @Test
    fun testDeepLinkAlertIdExtractionForCustomScheme() {
        val uri = "vayu://alert/ALR-2026-00042"
        val destination = DeepLinkHandler.parse(uri)

        assertTrue(destination is DeepLinkHandler.DeepLinkDestination.AlertDetail)
        val alertDetail = destination as DeepLinkHandler.DeepLinkDestination.AlertDetail
        assertEquals("ALR-2026-00042", alertDetail.alertId)
    }

    @Test
    fun testDeepLinkAlertIdExtractionForHttpsDomain() {
        val uri = "https://alerts.vayusat.live/alert/ALR-2026-00088"
        val destination = DeepLinkHandler.parse(uri)

        assertTrue(destination is DeepLinkHandler.DeepLinkDestination.AlertDetail)
        val alertDetail = destination as DeepLinkHandler.DeepLinkDestination.AlertDetail
        assertEquals("ALR-2026-00088", alertDetail.alertId)
    }

    @Test
    fun testCanonicalAlertIdIntegrity() {
        // Section 4 requirement: The Android application must use alert_id as the canonical identifier.
        val fcmData = mapOf(
            "alert_id" to "ALR-2026-CANONICAL-99",
            "title" to "Different Title",
            "message" to "Different Message"
        )
        val alert = NotificationPayloadParser.parse(fcmData)
        assertNotNull(alert)
        assertEquals("ALR-2026-CANONICAL-99", alert?.alertId)
    }
}
