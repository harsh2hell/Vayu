package live.vayusat.alerts

import android.app.Application
import live.vayusat.alerts.fcm.NotificationChannelManager

/**
 * Main Application class for VAYU Alerts.
 * Initializes notification channels on startup.
 */
class VayuAlertsApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // Register all 5 notification channels with Android system
        NotificationChannelManager.createNotificationChannels(this)
    }
}
