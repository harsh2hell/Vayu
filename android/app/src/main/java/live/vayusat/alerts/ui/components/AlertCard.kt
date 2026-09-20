package live.vayusat.alerts.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import live.vayusat.alerts.data.model.AlertSeverity
import live.vayusat.alerts.data.model.VayuAlert
import live.vayusat.alerts.ui.theme.SeverityCritical
import live.vayusat.alerts.ui.theme.SeverityCriticalBg
import live.vayusat.alerts.ui.theme.SeverityWarning
import live.vayusat.alerts.ui.theme.SeverityWarningBg
import live.vayusat.alerts.ui.theme.VayuCyanPrimary

@Composable
fun AlertCard(
    alert: VayuAlert,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor = when (alert.severity) {
        AlertSeverity.CRITICAL -> SeverityCritical.copy(alpha = 0.5f)
        AlertSeverity.WARNING -> SeverityWarning.copy(alpha = 0.4f)
        else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
    }

    val cardBg = when (alert.severity) {
        AlertSeverity.CRITICAL -> SeverityCriticalBg.copy(alpha = 0.15f)
        AlertSeverity.WARNING -> SeverityWarningBg.copy(alpha = 0.12f)
        else -> MaterialTheme.colorScheme.surfaceVariant
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = cardBg),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                SeverityBadge(severity = alert.severity)

                if (alert.stormName != null) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = alert.stormName,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                if (!alert.isRead) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(VayuCyanPrimary, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                }

                val formattedDate = alert.createdAt.take(16).replace("T", " ")
                Text(
                    text = formattedDate,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = alert.title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = alert.message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
            )

            if (alert.region != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Region: ${alert.region}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
