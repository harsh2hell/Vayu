package live.vayusat.alerts

import live.vayusat.alerts.util.DeepLinkHandler
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DeepLinkHandlerTest {

    @Test
    fun testAlertDeepLinkParsing() {
        val dest1 = DeepLinkHandler.parse("vayu://alert/ALR-2026-00001")
        assertTrue(dest1 is DeepLinkHandler.DeepLinkDestination.AlertDetail)
        assertEquals("ALR-2026-00001", (dest1 as DeepLinkHandler.DeepLinkDestination.AlertDetail).alertId)

        val dest2 = DeepLinkHandler.parse("https://alerts.vayusat.live/alert/ALR-2026-999")
        assertTrue(dest2 is DeepLinkHandler.DeepLinkDestination.AlertDetail)
        assertEquals("ALR-2026-999", (dest2 as DeepLinkHandler.DeepLinkDestination.AlertDetail).alertId)
    }

    @Test
    fun testScreenRoutes() {
        val homeDest = DeepLinkHandler.parse("vayu://home")
        assertEquals(DeepLinkHandler.DeepLinkDestination.Home, homeDest)

        val mapDest = DeepLinkHandler.parse("vayu://map")
        assertEquals(DeepLinkHandler.DeepLinkDestination.Map, mapDest)

        val settingsDest = DeepLinkHandler.parse("vayu://settings")
        assertEquals(DeepLinkHandler.DeepLinkDestination.Settings, settingsDest)
    }

    @Test
    fun testNullAndInvalidHandling() {
        assertNull(DeepLinkHandler.parse(null as String?))
        assertNull(DeepLinkHandler.parse(""))

        val unknown = DeepLinkHandler.parse("https://example.com/unsupported/path")
        assertTrue(unknown is DeepLinkHandler.DeepLinkDestination.Unknown)
    }
}
