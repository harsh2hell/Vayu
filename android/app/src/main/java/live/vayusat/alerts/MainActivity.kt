package live.vayusat.alerts

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.mutableStateOf
import androidx.navigation.compose.rememberNavController
import live.vayusat.alerts.data.local.VayuDatabase
import live.vayusat.alerts.data.remote.RemoteConfigService
import live.vayusat.alerts.data.remote.VayuApiService
import live.vayusat.alerts.data.repository.AlertRepository
import live.vayusat.alerts.data.repository.DeviceRepository
import live.vayusat.alerts.ui.navigation.Screen
import live.vayusat.alerts.ui.navigation.VayuNavGraph
import live.vayusat.alerts.ui.theme.VayuAlertsTheme
import live.vayusat.alerts.util.DeepLinkHandler

class MainActivity : ComponentActivity() {

    private lateinit var alertRepository: AlertRepository
    private lateinit var deviceRepository: DeviceRepository
    private lateinit var remoteConfigService: RemoteConfigService

    private val initialAlertIdState = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize core dependencies
        val apiService = VayuApiService()
        val database = VayuDatabase.getInstance(applicationContext)
        alertRepository = AlertRepository(apiService, database)
        deviceRepository = DeviceRepository(applicationContext, apiService)
        remoteConfigService = RemoteConfigService()

        // Extract deep link destination if launched via notification or URL
        handleIncomingIntent(intent)

        setContent {
            VayuAlertsTheme {
                val navController = rememberNavController()
                VayuNavGraph(
                    navController = navController,
                    alertRepository = alertRepository,
                    deviceRepository = deviceRepository,
                    remoteConfigService = remoteConfigService,
                    initialDeepLinkAlertId = initialAlertIdState.value
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        val uri = intent?.data ?: return
        when (val destination = DeepLinkHandler.parse(uri)) {
            is DeepLinkHandler.DeepLinkDestination.AlertDetail -> {
                initialAlertIdState.value = destination.alertId
            }
            else -> {}
        }
    }
}
