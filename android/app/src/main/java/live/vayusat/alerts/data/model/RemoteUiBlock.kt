package live.vayusat.alerts.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Server-Driven UI (SDUI) schema for remote configurable content.
 * Enables dynamic update of home cards, advisory banners, and preparedness checklists
 * without requiring client-side APK recompilation or unsafe code execution.
 */
@JsonClass(generateAdapter = false)
data class RemoteUiBlock(
    @Json(name = "block_id") val blockId: String,
    @Json(name = "type") val type: String, // BANNER, CARD, CHECKLIST, STATS, EMERGENCY_CONTACTS
    @Json(name = "title") val title: String,
    @Json(name = "subtitle") val subtitle: String? = null,
    @Json(name = "body") val body: String = "",
    @Json(name = "action_label") val actionLabel: String? = null,
    @Json(name = "action_deep_link") val actionDeepLink: String? = null,
    @Json(name = "priority") val priority: Int = 100,
    @Json(name = "badge_text") val badgeText: String? = null,
    @Json(name = "style_theme") val styleTheme: String = "MONOCHROMATIC",
    @Json(name = "is_dismissible") val isDismissible: Boolean = false
) {
    // Secondary constructor for convenience
    constructor(
        id: String,
        type: String,
        title: String,
        body: String,
        priority: Int = 100,
        actionLabel: String? = null,
        actionUrl: String? = null
    ) : this(
        blockId = id,
        type = type,
        title = title,
        subtitle = null,
        body = body,
        actionLabel = actionLabel,
        actionDeepLink = actionUrl,
        priority = priority
    )

    val id: String get() = blockId
    val actionUrl: String? get() = actionDeepLink
}

@JsonClass(generateAdapter = false)
data class RemoteAppConfig(
    @Json(name = "min_supported_version") val minSupportedVersion: String = "1.0.0",
    @Json(name = "feature_flags") val featureFlags: Map<String, Boolean> = mapOf(
        "enable_siren_vibration" to true,
        "enable_radar_overlay" to true,
        "enable_citizen_shelter_finder" to true
    ),
    @Json(name = "emergency_helpline") val emergencyHelpline: String = "112 / 1078",
    @Json(name = "home_blocks") val homeBlocks: List<RemoteUiBlock> = emptyList()
) {
    constructor(
        version: String,
        minSupportedAppVersion: String,
        features: Map<String, Boolean>,
        uiBlocks: List<RemoteUiBlock>
    ) : this(
        minSupportedVersion = minSupportedAppVersion,
        featureFlags = features,
        emergencyHelpline = "112 / 1078",
        homeBlocks = uiBlocks
    )

    val uiBlocks: List<RemoteUiBlock> get() = homeBlocks
}

typealias RemoteConfig = RemoteAppConfig
