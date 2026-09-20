package live.vayusat.alerts

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import live.vayusat.alerts.data.model.DeviceRegistrationRequest
import live.vayusat.alerts.data.model.NotificationPreferences
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DeviceRegistrationModelTest {

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    @Test
    fun testDeviceRegistrationSerialization() {
        val adapter = moshi.adapter(DeviceRegistrationRequest::class.java)

        val req = DeviceRegistrationRequest(
            fcm_token = "fcm-test-token-123",
            device_id = "device-uuid-abc",
            platform = "android",
            app_version = "10.0.0",
            os_version = "Android 15",
            device_model = "Pixel 9 Pro",
            locale = "en-IN"
        )

        val json = adapter.toJson(req)
        assertNotNull(json)
        assertTrue(json.contains("fcm-test-token-123"))
        assertTrue(json.contains("Pixel 9 Pro"))

        val deserialized = adapter.fromJson(json)
        assertNotNull(deserialized)
        assertEquals("fcm-test-token-123", deserialized?.fcm_token)
        assertEquals("android", deserialized?.platform)
    }

    @Test
    fun testNotificationPreferencesSerialization() {
        val adapter = moshi.adapter(NotificationPreferences::class.java)

        val prefs = NotificationPreferences(
            deviceId = "device-uuid-abc",
            criticalAlerts = true,
            warningAlerts = true,
            watchAlerts = false,
            infoAlerts = false,
            soundEnabled = true,
            vibrationEnabled = true,
            distanceRadiusKm = 300.0,
            preferredRegions = listOf("Odisha", "West Bengal", "Andhra Pradesh")
        )

        val json = adapter.toJson(prefs)
        assertNotNull(json)
        assertTrue(json.contains("Odisha"))

        val deserialized = adapter.fromJson(json)
        assertNotNull(deserialized)
        assertEquals(3, deserialized?.preferred_regions?.size)
        assertEquals(300.0, deserialized?.distance_radius_km ?: 0.0, 0.001)
    }
}
