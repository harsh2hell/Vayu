package live.vayusat.alerts.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.ui.theme.SeverityCritical
import live.vayusat.alerts.ui.theme.SeverityCriticalBg
import live.vayusat.alerts.ui.theme.SeverityInfo
import live.vayusat.alerts.ui.theme.SeverityInfoBg
import live.vayusat.alerts.ui.theme.SeverityTest
import live.vayusat.alerts.ui.theme.SeverityTestBg
import live.vayusat.alerts.ui.theme.SeverityWarning
import live.vayusat.alerts.ui.theme.SeverityWarningBg
import live.vayusat.alerts.ui.theme.SeverityWatch
import live.vayusat.alerts.ui.theme.SeverityWatchBg

@Composable
fun SeverityBadge(
    severity: AlertSeverity,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, borderColor) = when (severity) {
        AlertSeverity.CRITICAL -> Triple(SeverityCriticalBg, SeverityCritical, SeverityCritical.copy(alpha = 0.5f))
        AlertSeverity.WARNING -> Triple(SeverityWarningBg, SeverityWarning, SeverityWarning.copy(alpha = 0.5f))
        AlertSeverity.WATCH -> Triple(SeverityWatchBg, SeverityWatch, SeverityWatch.copy(alpha = 0.5f))
        AlertSeverity.INFO -> Triple(SeverityInfoBg, SeverityInfo, SeverityInfo.copy(alpha = 0.5f))
        AlertSeverity.TEST -> Triple(SeverityTestBg, SeverityTest, SeverityTest.copy(alpha = 0.5f))
    }

    Box(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(6.dp))
            .border(1.dp, borderColor, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = severity.name,
            color = textColor,
            style = MaterialTheme.typography.labelSmall
        )
    }
}
