package live.vayusat.alerts.data.model

/**
 * Standardized origin source for cyclone intelligence alerts.
 * Enforces clear legal distinction between experimental model-derived intelligence
 * and statutory government meteorological warnings (IMD/MoES).
 */
enum class AlertSource(
    val code: String,
    val displayName: String,
    val disclaimer: String
) {
    VAYU_MODEL(
        code = "VAYU_MODEL",
        displayName = "VAYU AI Model Forecast",
        disclaimer = "Autonomous AI model-derived risk intelligence. For planning and situational awareness; always heed statutory IMD/NDMA directives."
    ),
    VAYU_OPERATOR(
        code = "VAYU_OPERATOR",
        displayName = "VAYU Operations Console",
        disclaimer = "Validated by authorized VAYU meteorological duty officer."
    ),
    OFFICIAL_ADVISORY(
        code = "OFFICIAL_ADVISORY",
        displayName = "Official Government Advisory",
        disclaimer = "Statutory advisory re-broadcasted directly from official national emergency authorities (IMD / NDMA / SDMA)."
    ),
    TEST(
        code = "TEST",
        displayName = "System Verification Test",
        disclaimer = "Non-emergency technical drill to verify notification channel acoustic readiness."
    );

    fun isStatutoryWarning(): Boolean = this == OFFICIAL_ADVISORY

    companion object {
        fun fromString(value: String?): AlertSource {
            return entries.firstOrNull { it.code.equals(value?.trim(), ignoreCase = true) } ?: VAYU_MODEL
        }
    }
}
