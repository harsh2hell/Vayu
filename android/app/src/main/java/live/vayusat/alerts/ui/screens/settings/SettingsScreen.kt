package live.vayusat.alerts.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import live.vayusat.alerts.ui.components.StatutoryDisclaimerBanner
import live.vayusat.alerts.ui.theme.SeverityCritical
import live.vayusat.alerts.ui.theme.SeverityInfo
import live.vayusat.alerts.ui.theme.SeverityWarning
import live.vayusat.alerts.ui.theme.SeverityWatch
import live.vayusat.alerts.ui.theme.VayuCyanPrimary

@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val prefs by viewModel.preferences.collectAsState()
    val token by viewModel.fcmToken.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Preferences & Diagnostics",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Alert Subscriptions & Device Configuration",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Severity Subscriptions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Severity Subscriptions",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    SettingToggleRow(
                        title = "Critical Alerts",
                        subtitle = "Landfall threats & emergency advisories",
                        isChecked = prefs.critical_alerts,
                        activeColor = SeverityCritical,
                        onCheckedChange = { viewModel.toggleCritical(it) }
                    )

                    SettingToggleRow(
                        title = "Warning Alerts",
                        subtitle = "Approaching cyclonic storm warnings (<24h)",
                        isChecked = prefs.warning_alerts,
                        activeColor = SeverityWarning,
                        onCheckedChange = { viewModel.toggleWarning(it) }
                    )

                    SettingToggleRow(
                        title = "Watch Advisories",
                        subtitle = "Depressions and intensification tracks",
                        isChecked = prefs.watch_alerts,
                        activeColor = SeverityWatch,
                        onCheckedChange = { viewModel.toggleWatch(it) }
                    )

                    SettingToggleRow(
                        title = "Informational Summaries",
                        subtitle = "Meteorological and bulletin summaries",
                        isChecked = prefs.info_alerts,
                        activeColor = SeverityInfo,
                        onCheckedChange = { viewModel.toggleInfo(it) }
                    )
                }
            }

            // Notification Delivery Options
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Delivery Feedback",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    SettingToggleRow(
                        title = "Sound Alert",
                        subtitle = "Play auditory chime for high severity advisories",
                        isChecked = prefs.sound_enabled,
                        onCheckedChange = { viewModel.toggleSound(it) }
                    )

                    SettingToggleRow(
                        title = "Vibration Pattern",
                        subtitle = "Haptic feedback pattern for critical alerts",
                        isChecked = prefs.vibration_enabled,
                        onCheckedChange = { viewModel.toggleVibration(it) }
                    )
                }
            }

            // Proximity Radius Slider
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Threat Proximity Radius",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "${prefs.distance_radius_km.toInt()} km",
                            style = MaterialTheme.typography.labelLarge,
                            color = VayuCyanPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Filter alerts within chosen distance from your location.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Slider(
                        value = prefs.distance_radius_km.toFloat(),
                        onValueChange = { viewModel.updateRadius(it.toDouble()) },
                        valueRange = 50f..1000f,
                        steps = 18,
                        colors = SliderDefaults.colors(
                            thumbColor = VayuCyanPrimary,
                            activeTrackColor = VayuCyanPrimary
                        )
                    )
                }
            }

            // Device Status Card (Section 11)
            val context = androidx.compose.ui.platform.LocalContext.current
            val isNotifAllowed = androidx.core.app.NotificationManagerCompat.from(context).areNotificationsEnabled()
            val isBackendOnline by viewModel.isBackendConnected.collectAsState()

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Device Status",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    // FCM Status
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "FCM:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (token != null) "Connected" else "Not connected",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Bold,
                            color = if (token != null) SeverityWatch else MaterialTheme.colorScheme.error
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Device ID
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Device ID:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = viewModel.deviceId,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Last token sync
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Last token sync:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = viewModel.lastTokenSync,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Backend Status
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Backend:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (isBackendOnline) "Connected" else "Offline",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Bold,
                            color = if (isBackendOnline) SeverityWatch else MaterialTheme.colorScheme.error
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Notification Permission
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Notification permission:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (isNotifAllowed) "Allowed" else "Denied",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Bold,
                            color = if (isNotifAllowed) SeverityWatch else MaterialTheme.colorScheme.error
                        )
                    }
                }
            }

            // Statutory Disclaimer
            StatutoryDisclaimerBanner()

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun SettingToggleRow(
    title: String,
    subtitle: String,
    isChecked: Boolean,
    activeColor: androidx.compose.ui.graphics.Color = VayuCyanPrimary,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Switch(
            checked = isChecked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = activeColor)
        )
    }
}
