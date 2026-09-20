package live.vayusat.alerts.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import live.vayusat.alerts.data.remote.RemoteConfigService
import live.vayusat.alerts.data.repository.AlertRepository
import live.vayusat.alerts.data.repository.DeviceRepository
import live.vayusat.alerts.ui.screens.alerts.AlertsScreen
import live.vayusat.alerts.ui.screens.alerts.AlertsViewModel
import live.vayusat.alerts.ui.screens.detail.AlertDetailScreen
import live.vayusat.alerts.ui.screens.detail.AlertDetailViewModel
import live.vayusat.alerts.ui.screens.home.HomeScreen
import live.vayusat.alerts.ui.screens.home.HomeViewModel
import live.vayusat.alerts.ui.screens.map.MapScreen
import live.vayusat.alerts.ui.screens.map.MapViewModel
import live.vayusat.alerts.ui.screens.onboarding.OnboardingScreen
import live.vayusat.alerts.ui.screens.onboarding.OnboardingViewModel
import live.vayusat.alerts.ui.screens.settings.SettingsScreen
import live.vayusat.alerts.ui.screens.settings.SettingsViewModel
import live.vayusat.alerts.ui.theme.VayuCyanPrimary

@Composable
fun VayuNavGraph(
    navController: NavHostController,
    alertRepository: AlertRepository,
    deviceRepository: DeviceRepository,
    remoteConfigService: RemoteConfigService,
    initialDeepLinkAlertId: String? = null
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val isOnboarding = !deviceRepository.isOnboardingCompleted()
    val startDestination = when {
        initialDeepLinkAlertId != null -> Screen.AlertDetail.createRoute(initialDeepLinkAlertId)
        isOnboarding -> Screen.Onboarding.route
        else -> Screen.Home.route
    }

    val showBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Alerts.route,
        Screen.Map.route,
        Screen.Settings.route
    )

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = MaterialTheme.colorScheme.onSurface
                ) {
                    Screen.bottomNavItems.forEach { screen ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                screen.icon?.let {
                                    Icon(imageVector = it, contentDescription = screen.title)
                                }
                            },
                            label = { Text(screen.title) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = VayuCyanPrimary,
                                selectedTextColor = VayuCyanPrimary,
                                indicatorColor = VayuCyanPrimary.copy(alpha = 0.15f)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            // Onboarding
            composable(Screen.Onboarding.route) {
                val vm = OnboardingViewModel(deviceRepository)
                OnboardingScreen(
                    viewModel = vm,
                    onComplete = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            // Home
            composable(Screen.Home.route) {
                val vm = HomeViewModel(alertRepository, remoteConfigService)
                HomeScreen(
                    viewModel = vm,
                    onAlertClick = { alertId ->
                        navController.navigate(Screen.AlertDetail.createRoute(alertId))
                    },
                    onViewAllAlertsClick = {
                        navController.navigate(Screen.Alerts.route)
                    }
                )
            }

            // Alerts
            composable(Screen.Alerts.route) {
                val vm = AlertsViewModel(alertRepository)
                AlertsScreen(
                    viewModel = vm,
                    onAlertClick = { alertId ->
                        navController.navigate(Screen.AlertDetail.createRoute(alertId))
                    }
                )
            }

            // Map
            composable(Screen.Map.route) {
                val vm = MapViewModel(alertRepository)
                MapScreen(viewModel = vm)
            }

            // Settings
            composable(Screen.Settings.route) {
                val vm = SettingsViewModel(deviceRepository)
                SettingsScreen(viewModel = vm)
            }

            // Alert Detail (with deep link support)
            composable(
                route = Screen.AlertDetail.route,
                arguments = listOf(navArgument("alertId") { type = NavType.StringType }),
                deepLinks = listOf(
                    navDeepLink { uriPattern = "vayu://alert/{alertId}" },
                    navDeepLink { uriPattern = "https://alerts.vayusat.live/alert/{alertId}" }
                )
            ) { backStackEntry ->
                val alertId = backStackEntry.arguments?.getString("alertId") ?: ""
                val vm = AlertDetailViewModel(alertRepository, alertId)
                AlertDetailScreen(
                    viewModel = vm,
                    onBackClick = {
                        if (!navController.popBackStack()) {
                            navController.navigate(Screen.Home.route)
                        }
                    }
                )
            }
        }
    }
}
