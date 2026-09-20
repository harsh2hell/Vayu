package live.vayusat.alerts.fcm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import live.vayusat.alerts.R

/**
 * Manages creation and maintenance of the 5 standardized VAYU notification channels:
 * 1. CRITICAL (Urgent: cyclone landfall threat, life safety risk)
 * 2. WARNING (High: severe cyclonic storm approaching within 24h)
 * 3. WATCH (Default: cyclonic depression or intensification advisory)
 * 4. INFORMATION (Low: informational updates, operational summaries)
 * 5. TEST (Low: verification and diagnostic alerts)
 */
object NotificationChannelManager {

    const val CHANNEL_CRITICAL = "vayu_channel_critical"
    const val CHANNEL_WARNING = "vayu_channel_warning"
    const val CHANNEL_WATCH = "vayu_channel_watch"
    const val CHANNEL_INFORMATION = "vayu_channel_information"
    const val CHANNEL_TEST = "vayu_channel_test"

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return

        val alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
            .build()

        // 1. Critical Channel
        val criticalChannel = NotificationChannel(
            CHANNEL_CRITICAL,
            context.getString(R.string.channel_critical_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.channel_critical_desc)
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 800)
            enableLights(true)
            setSound(alarmSound, audioAttributes)
            setShowBadge(true)
        }

        // 2. Warning Channel
        val warningChannel = NotificationChannel(
            CHANNEL_WARNING,
            context.getString(R.string.channel_warning_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.channel_warning_desc)
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 350, 150, 350)
            enableLights(true)
            setShowBadge(true)
        }

        // 3. Watch Channel
        val watchChannel = NotificationChannel(
            CHANNEL_WATCH,
            context.getString(R.string.channel_watch_name),
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = context.getString(R.string.channel_watch_desc)
            enableVibration(true)
            setShowBadge(true)
        }

        // 4. Information Channel
        val infoChannel = NotificationChannel(
            CHANNEL_INFORMATION,
            context.getString(R.string.channel_info_name),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = context.getString(R.string.channel_info_desc)
            setShowBadge(false)
        }

        // 5. Test Channel
        val testChannel = NotificationChannel(
            CHANNEL_TEST,
            context.getString(R.string.channel_test_name),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = context.getString(R.string.channel_test_desc)
            setShowBadge(false)
        }

        notificationManager.createNotificationChannels(
            listOf(criticalChannel, warningChannel, watchChannel, infoChannel, testChannel)
        )
    }

    fun getChannelIdForSeverity(severityName: String): String {
        return when (severityName.uppercase()) {
            "CRITICAL" -> CHANNEL_CRITICAL
            "WARNING" -> CHANNEL_WARNING
            "WATCH" -> CHANNEL_WATCH
            "INFO", "INFORMATION" -> CHANNEL_INFORMATION
            "TEST" -> CHANNEL_TEST
            else -> CHANNEL_WATCH
        }
    }
}
