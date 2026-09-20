package live.vayusat.alerts.data.model

/**
 * Standardized VAYU Alert Severity Levels.
 * Maps directly to Android Notification Channel importance and UI urgency hierarchy.
 */
enum class AlertSeverity(
    val code: String,
    val channelId: String,
    val displayName: String,
    val importanceDescription: String
) {
    CRITICAL(
        code = "CRITICAL",
        channelId = "channel_critical",
        displayName = "Critical Warning",
        importanceDescription = "Immediate life-safety and coastal evacuation orders"
    ),
    WARNING(
        code = "WARNING",
        channelId = "channel_warning",
        displayName = "Cyclone Warning",
        importanceDescription = "High strike risk within 24 hours"
    ),
    WATCH(
        code = "WATCH",
        channelId = "channel_watch",
        displayName = "Cyclone Watch",
        importanceDescription = "Pre-cyclone tracking and potential landfall 48h-72h prior"
    ),
    INFO(
        code = "INFO",
        channelId = "channel_info",
        displayName = "Information",
        importanceDescription = "Ocean bulletins and post-storm recovery updates"
    ),
    TEST(
        code = "TEST",
        channelId = "channel_test",
        displayName = "Diagnostic Test",
        importanceDescription = "Civil defense alert system drills and channel verification"
    );

    companion object {
        fun fromString(value: String?): AlertSeverity {
            val clean = value?.trim()?.uppercase() ?: return INFO
            if (clean == "INFORMATION") return INFO
            return entries.firstOrNull { it.code == clean } ?: INFO
        }
    }
}
