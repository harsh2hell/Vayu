package live.vayusat.alerts

import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.AlertSource
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SeverityHandlingTest {

    @Test
    fun testSeverityFromStringParsing() {
        assertEquals(AlertSeverity.CRITICAL, AlertSeverity.fromString("CRITICAL"))
        assertEquals(AlertSeverity.CRITICAL, AlertSeverity.fromString("critical"))
        assertEquals(AlertSeverity.WARNING, AlertSeverity.fromString("WARNING"))
        assertEquals(AlertSeverity.WATCH, AlertSeverity.fromString("WATCH"))
        assertEquals(AlertSeverity.INFO, AlertSeverity.fromString("INFO"))
        assertEquals(AlertSeverity.INFO, AlertSeverity.fromString("INFORMATION"))
        assertEquals(AlertSeverity.TEST, AlertSeverity.fromString("TEST"))

        // Unknown or invalid strings safely fallback to INFO
        assertEquals(AlertSeverity.INFO, AlertSeverity.fromString("UNKNOWN_VALUE"))
        assertEquals(AlertSeverity.INFO, AlertSeverity.fromString(null))
    }

    @Test
    fun testAlertSourceParsingAndStatutoryDisclaimer() {
        assertEquals(AlertSource.VAYU_MODEL, AlertSource.fromString("VAYU_MODEL"))
        assertEquals(AlertSource.VAYU_OPERATOR, AlertSource.fromString("VAYU_OPERATOR"))
        assertEquals(AlertSource.OFFICIAL_ADVISORY, AlertSource.fromString("OFFICIAL_ADVISORY"))
        assertEquals(AlertSource.TEST, AlertSource.fromString("TEST"))
        assertEquals(AlertSource.VAYU_MODEL, AlertSource.fromString("invalid"))

        // Requirement 9: Model and operator alerts must never be represented as statutory government warnings
        assertFalse(AlertSource.VAYU_MODEL.isStatutoryWarning())
        assertFalse(AlertSource.VAYU_OPERATOR.isStatutoryWarning())
        assertFalse(AlertSource.TEST.isStatutoryWarning())
        assertTrue(AlertSource.OFFICIAL_ADVISORY.isStatutoryWarning())
    }
}
