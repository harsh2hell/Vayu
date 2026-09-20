package live.vayusat.alerts.ui.screens.map

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import live.vayusat.alerts.ui.theme.SeverityCritical
import live.vayusat.alerts.ui.theme.SeverityWarning
import live.vayusat.alerts.ui.theme.VayuCyanPrimary
import live.vayusat.alerts.ui.theme.VayuNavyDark

@Composable
fun MapScreen(viewModel: MapViewModel) {
    val state by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(VayuNavyDark)
    ) {
        // Trajectory Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // Background Atmospheric Grid
            val gridColor = Color(0xFF1E293B)
            for (i in 1..8) {
                val y = height * (i / 9f)
                drawLine(
                    color = gridColor,
                    start = Offset(0f, y),
                    end = Offset(width, y),
                    strokeWidth = 1f
                )
            }
            for (i in 1..5) {
                val x = width * (i / 6f)
                drawLine(
                    color = gridColor,
                    start = Offset(x, 0f),
                    end = Offset(x, height),
                    strokeWidth = 1f
                )
            }

            // Uncertainty Corridor (Cone)
            val conePath = Path().apply {
                val p0 = Offset(width * 0.55f, height * 0.70f)
                val p1 = Offset(width * 0.40f, height * 0.50f)
                val p2 = Offset(width * 0.25f, height * 0.28f)
                val p3 = Offset(width * 0.45f, height * 0.25f)
                val p4 = Offset(width * 0.60f, height * 0.48f)

                moveTo(p0.x, p0.y)
                lineTo(p1.x - 40f, p1.y)
                lineTo(p2.x - 70f, p2.y)
                lineTo(p3.x + 70f, p3.y)
                lineTo(p4.x + 40f, p4.y)
                close()
            }
            drawPath(
                path = conePath,
                color = VayuCyanPrimary.copy(alpha = 0.12f)
            )

            // Projected Track Line
            val trackPath = Path().apply {
                moveTo(width * 0.55f, height * 0.70f)
                lineTo(width * 0.48f, height * 0.56f)
                lineTo(width * 0.40f, height * 0.42f)
                lineTo(width * 0.32f, height * 0.28f)
            }
            drawPath(
                path = trackPath,
                color = VayuCyanPrimary,
                style = Stroke(width = 4f, cap = StrokeCap.Round)
            )

            // Current Cyclone Eye (Pulsing Center)
            val eyeCenter = Offset(width * 0.55f, height * 0.70f)
            drawCircle(
                color = SeverityCritical.copy(alpha = 0.25f),
                radius = 35f,
                center = eyeCenter
            )
            drawCircle(
                color = SeverityCritical,
                radius = 12f,
                center = eyeCenter
            )

            // Landfall Waypoint
            val landfallPoint = Offset(width * 0.32f, height * 0.28f)
            drawCircle(
                color = SeverityWarning.copy(alpha = 0.3f),
                radius = 24f,
                center = landfallPoint
            )
            drawCircle(
                color = SeverityWarning,
                radius = 8f,
                center = landfallPoint
            )
        }

        // Top Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 24.dp, start = 20.dp, end = 20.dp)
        ) {
            Text(
                text = "Operational Track Forecast",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Bay of Bengal Basin | 2-Layer Trajectory GRU",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF94A3B8)
            )
        }

        // Bottom HUD Card
        Card(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(16.dp)
                .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xEE0F172A))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = state.stormName,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = state.stormCategory,
                            style = MaterialTheme.typography.bodySmall,
                            color = SeverityWarning
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(Color(0xFF1E293B), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "${state.currentWindKnots} kts",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = VayuCyanPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "CURRENT POSITION", style = MaterialTheme.typography.labelSmall, color = Color(0xFF64748B))
                        Text(text = "${state.currentLat}°N, ${state.currentLon}°E", style = MaterialTheme.typography.bodySmall, color = Color.White)
                    }
                    Column {
                        Text(text = "HEADING", style = MaterialTheme.typography.labelSmall, color = Color(0xFF64748B))
                        Text(text = state.heading, style = MaterialTheme.typography.bodySmall, color = Color.White)
                    }
                    Column {
                        Text(text = "CONE RADIUS", style = MaterialTheme.typography.labelSmall, color = Color(0xFF64748B))
                        Text(text = "±${state.uncertaintyRadiusKm.toInt()} km", style = MaterialTheme.typography.bodySmall, color = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "VAYU Model forecast. Official landfall alerts issued by IMD.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF94A3B8)
                    )
                }
            }
        }
    }
}
