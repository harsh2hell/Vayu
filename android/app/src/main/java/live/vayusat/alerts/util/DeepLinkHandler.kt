package live.vayusat.alerts.util

import android.net.Uri

/**
 * Parses and validates deep links for the VAYU Alerts application.
 * Supported URIs:
 * - vayu://alert/{alertId}
 * - https://vayu.live/alert/{alertId}
 * - https://alerts.vayusat.live/alert/{alertId}
 */
object DeepLinkHandler {

    sealed class DeepLinkDestination {
        data class AlertDetail(val alertId: String) : DeepLinkDestination()
        object Home : DeepLinkDestination()
        object Map : DeepLinkDestination()
        object Settings : DeepLinkDestination()
        data class Unknown(val uri: String) : DeepLinkDestination()
    }

    fun parse(urlString: String?): DeepLinkDestination? {
        if (urlString.isNullOrBlank()) return null
        val trimmed = urlString.trim()

        if (trimmed.startsWith("vayu://")) {
            val withoutScheme = trimmed.removePrefix("vayu://")
            val parts = withoutScheme.split('/')
            val host = parts.getOrNull(0) ?: ""
            return when (host) {
                "alert" -> {
                    val alertId = parts.getOrNull(1) ?: ""
                    if (alertId.isNotBlank()) DeepLinkDestination.AlertDetail(alertId) else DeepLinkDestination.Home
                }
                "home" -> DeepLinkDestination.Home
                "map" -> DeepLinkDestination.Map
                "settings" -> DeepLinkDestination.Settings
                else -> {
                    if (withoutScheme.contains("alert/")) {
                        val alertId = withoutScheme.substringAfter("alert/").trim('/')
                        if (alertId.isNotBlank()) DeepLinkDestination.AlertDetail(alertId) else DeepLinkDestination.Home
                    } else {
                        DeepLinkDestination.Unknown(trimmed)
                    }
                }
            }
        } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            val path = trimmed.substringAfter("://").substringAfter('/', "")
            if (path.startsWith("alert/")) {
                val alertId = path.removePrefix("alert/").trim('/')
                if (alertId.isNotBlank()) return DeepLinkDestination.AlertDetail(alertId)
            }
            if (path == "map") return DeepLinkDestination.Map
            if (path == "settings") return DeepLinkDestination.Settings
            if (path.isEmpty() || path == "home") return DeepLinkDestination.Home
        }

        return DeepLinkDestination.Unknown(trimmed)
    }

    fun parse(uri: Uri?): DeepLinkDestination? {
        if (uri == null) return null
        return parse(uri.toString())
    }
}
