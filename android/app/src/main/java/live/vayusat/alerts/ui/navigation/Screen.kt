package live.vayusat.alerts.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Onboarding : Screen("onboarding", "Welcome")
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Alerts : Screen("alerts", "Alerts", Icons.Default.Notifications)
    object Map : Screen("map", "Map", Icons.Default.LocationOn)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
    object AlertDetail : Screen("alert/{alertId}", "Alert Details") {
        fun createRoute(alertId: String) = "alert/$alertId"
    }

    companion object {
        val bottomNavItems = listOf(Home, Alerts, Map, Settings)
    }
}
