package live.vayusat.alerts.fcm

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import live.vayusat.alerts.MainActivity
import live.vayusat.alerts.R
import live.vayusat.alerts.data.local.VayuDatabase
import live.vayusat.alerts.data.remote.VayuApiService
import live.vayusat.alerts.data.repository.DeviceRepository

/**
 * Firebase Cloud Messaging service for VAYU Alerts.
 * Receives remote messages, parses alerts, persists them locally for offline access,
 * and posts system notifications with deep link navigation intents.
 */
class VayuFirebaseMessagingService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.i(TAG, "New FCM Token received: $token")
        val apiService = VayuApiService()
        val deviceRepo = DeviceRepository(applicationContext, apiService)

        serviceScope.launch {
            try {
                deviceRepo.saveAndRegisterFcmToken(token)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to register new FCM token with backend", e)
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "Message received from: ${remoteMessage.from}")

        val data = remoteMessage.data
        if (data.isEmpty()) {
            // Notification-only payload
            remoteMessage.notification?.let {
                showBasicNotification(it.title ?: "VAYU Alert", it.body ?: "")
            }
            return
        }

        // Parse structured VAYU alert payload
        val alert = NotificationPayloadParser.parse(data)
        if (alert != null) {
            // 1. Persist alert locally for instant offline availability
            val database = VayuDatabase.getInstance(applicationContext)
            serviceScope.launch {
                try {
                    database.insertOrUpdateAlert(alert)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to cache alert locally", e)
                }
            }

            // 2. Display notification in the appropriate severity channel
            showAlertNotification(alert.alertId, alert.title, alert.message, alert.severity.name)
        } else {
            // Fallback for generic messages
            val title = data["title"] ?: "VAYU Cyclone Alert"
            val body = data["message"] ?: data["body"] ?: "New advisory received."
            val severity = data["severity"] ?: "WATCH"
            val alertId = data["alert_id"] ?: data["alertId"] ?: "latest"
            showAlertNotification(alertId, title, body, severity)
        }
    }

    private fun showAlertNotification(
        alertId: String,
        title: String,
        message: String,
        severityName: String
    ) {
        val channelId = NotificationChannelManager.getChannelIdForSeverity(severityName)

        // Construct deep link intent: vayu://alert/{alertId}
        val deepLinkUri = Uri.parse("vayu://alert/$alertId")
        val intent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = deepLinkUri
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            alertId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val priority = when (severityName.uppercase()) {
            "CRITICAL" -> NotificationCompat.PRIORITY_MAX
            "WARNING" -> NotificationCompat.PRIORITY_HIGH
            "WATCH" -> NotificationCompat.PRIORITY_DEFAULT
            else -> NotificationCompat.PRIORITY_LOW
        }

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_vayu_cyclone)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(priority)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(alertId.hashCode(), notificationBuilder.build())
    }

    private fun showBasicNotification(title: String, body: String) {
        val channelId = NotificationChannelManager.CHANNEL_WATCH
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_vayu_cyclone)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }

    companion object {
        private const val TAG = "VayuFcmService"
    }
}
