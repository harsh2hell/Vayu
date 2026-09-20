package live.vayusat.alerts.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = VayuCyanPrimary,
    onPrimary = VayuNavyDark,
    primaryContainer = VayuSurfaceDark,
    onPrimaryContainer = VayuCyanLight,
    secondary = VayuCyanLight,
    onSecondary = VayuNavyDark,
    background = VayuNavyDark,
    onBackground = TextPrimaryDark,
    surface = VayuSurfaceDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = VayuCardDark,
    onSurfaceVariant = TextSecondaryDark,
    outline = VayuBorderDark,
    error = SeverityCritical,
    onError = TextPrimaryDark
)

private val LightColorScheme = lightColorScheme(
    primary = VayuCyanDark,
    onPrimary = VayuCardLight,
    primaryContainer = VayuBorderLight,
    onPrimaryContainer = VayuCyanDark,
    secondary = VayuCyanPrimary,
    onSecondary = VayuCardLight,
    background = VayuSurfaceLight,
    onBackground = TextPrimaryLight,
    surface = VayuCardLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = VayuBorderLight,
    onSurfaceVariant = TextSecondaryLight,
    outline = VayuBorderLight,
    error = SeverityCritical,
    onError = VayuCardLight
)

@Composable
fun VayuAlertsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Set false by default to preserve distinct VAYU branding
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
