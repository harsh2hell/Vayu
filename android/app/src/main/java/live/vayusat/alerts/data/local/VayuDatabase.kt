package live.vayusat.alerts.data.local

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import live.vayusat.alerts.data.model.VayuAlert

/**
 * Thread-safe local SQLite persistence helper for offline alert caching.
 * Ensures alert history remains visible even when network connectivity is lost.
 */
class VayuDatabase(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "vayu_alerts_local.db"
        const val DATABASE_VERSION = 1

        const val TABLE_ALERTS = "cached_alerts"
        const val COL_ALERT_ID = "alert_id"
        const val COL_STORM_ID = "storm_id"
        const val COL_STORM_NAME = "storm_name"
        const val COL_SEVERITY = "severity"
        const val COL_TITLE = "title"
        const val COL_MESSAGE = "message"
        const val COL_CREATED_AT = "created_at"
        const val COL_EXPIRES_AT = "expires_at"
        const val COL_SOURCE = "source"
        const val COL_SOURCE_MODULE = "source_module"
        const val COL_LOCATION_REGION = "location_region"
        const val COL_LATITUDE = "latitude"
        const val COL_LONGITUDE = "longitude"
        const val COL_RADIUS_KM = "radius_km"
        const val COL_METADATA_JSON = "metadata_json"
        const val COL_IS_READ = "is_read"
        const val COL_IS_ACKNOWLEDGED = "is_acknowledged"
        const val COL_CACHED_AT_MILLIS = "cached_at_millis"

        @Volatile
        private var instance: VayuDatabase? = null

        fun getInstance(context: Context): VayuDatabase {
            return instance ?: synchronized(this) {
                instance ?: VayuDatabase(context.applicationContext).also { instance = it }
            }
        }
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS $TABLE_ALERTS (
                $COL_ALERT_ID TEXT PRIMARY KEY NOT NULL,
                $COL_STORM_ID TEXT,
                $COL_STORM_NAME TEXT NOT NULL,
                $COL_SEVERITY TEXT NOT NULL,
                $COL_TITLE TEXT NOT NULL,
                $COL_MESSAGE TEXT NOT NULL,
                $COL_CREATED_AT TEXT NOT NULL,
                $COL_EXPIRES_AT TEXT NOT NULL,
                $COL_SOURCE TEXT NOT NULL,
                $COL_SOURCE_MODULE TEXT,
                $COL_LOCATION_REGION TEXT,
                $COL_LATITUDE REAL,
                $COL_LONGITUDE REAL,
                $COL_RADIUS_KM REAL,
                $COL_METADATA_JSON TEXT,
                $COL_IS_READ INTEGER DEFAULT 0,
                $COL_IS_ACKNOWLEDGED INTEGER DEFAULT 0,
                $COL_CACHED_AT_MILLIS INTEGER NOT NULL
            );
        """.trimIndent())
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_ALERTS")
        onCreate(db)
    }

    @Synchronized
    fun upsertAlert(alert: VayuAlert) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_ALERT_ID, alert.alertId)
            put(COL_STORM_ID, alert.stormId)
            put(COL_STORM_NAME, alert.stormName)
            put(COL_SEVERITY, alert.severityCode)
            put(COL_TITLE, alert.title)
            put(COL_MESSAGE, alert.message)
            put(COL_CREATED_AT, alert.createdAt)
            put(COL_EXPIRES_AT, alert.expiresAt)
            put(COL_SOURCE, alert.sourceCode)
            put(COL_SOURCE_MODULE, alert.sourceModule)
            put(COL_LOCATION_REGION, alert.locationRegion)
            put(COL_LATITUDE, alert.latitude)
            put(COL_LONGITUDE, alert.longitude)
            put(COL_RADIUS_KM, alert.radiusKm)
            put(COL_IS_READ, if (alert.isRead) 1 else 0)
            put(COL_IS_ACKNOWLEDGED, if (alert.isAcknowledged) 1 else 0)
            put(COL_CACHED_AT_MILLIS, System.currentTimeMillis())
        }
        db.insertWithOnConflict(TABLE_ALERTS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    @Synchronized
    fun getAllCachedAlerts(): List<VayuAlert> {
        val list = mutableListOf<VayuAlert>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM $TABLE_ALERTS ORDER BY $COL_CACHED_AT_MILLIS DESC", null)
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    VayuAlert(
                        alertId = c.getString(c.getColumnIndexOrThrow(COL_ALERT_ID)),
                        stormId = c.getString(c.getColumnIndexOrThrow(COL_STORM_ID)),
                        stormName = c.getString(c.getColumnIndexOrThrow(COL_STORM_NAME)),
                        severityCode = c.getString(c.getColumnIndexOrThrow(COL_SEVERITY)),
                        title = c.getString(c.getColumnIndexOrThrow(COL_TITLE)),
                        message = c.getString(c.getColumnIndexOrThrow(COL_MESSAGE)),
                        createdAt = c.getString(c.getColumnIndexOrThrow(COL_CREATED_AT)),
                        expiresAt = c.getString(c.getColumnIndexOrThrow(COL_EXPIRES_AT)),
                        sourceCode = c.getString(c.getColumnIndexOrThrow(COL_SOURCE)),
                        sourceModule = c.getString(c.getColumnIndexOrThrow(COL_SOURCE_MODULE)),
                        locationRegion = c.getString(c.getColumnIndexOrThrow(COL_LOCATION_REGION)),
                        latitude = if (c.isNull(c.getColumnIndexOrThrow(COL_LATITUDE))) null else c.getDouble(c.getColumnIndexOrThrow(COL_LATITUDE)),
                        longitude = if (c.isNull(c.getColumnIndexOrThrow(COL_LONGITUDE))) null else c.getDouble(c.getColumnIndexOrThrow(COL_LONGITUDE)),
                        radiusKm = if (c.isNull(c.getColumnIndexOrThrow(COL_RADIUS_KM))) null else c.getDouble(c.getColumnIndexOrThrow(COL_RADIUS_KM)),
                        isRead = c.getInt(c.getColumnIndexOrThrow(COL_IS_READ)) == 1,
                        isAcknowledged = c.getInt(c.getColumnIndexOrThrow(COL_IS_ACKNOWLEDGED)) == 1
                    )
                )
            }
        }
        return list
    }

    @Synchronized
    fun getAlertById(alertId: String): VayuAlert? {
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM $TABLE_ALERTS WHERE $COL_ALERT_ID = ?", arrayOf(alertId))
        cursor.use { c ->
            if (c.moveToFirst()) {
                return VayuAlert(
                    alertId = c.getString(c.getColumnIndexOrThrow(COL_ALERT_ID)),
                    stormId = c.getString(c.getColumnIndexOrThrow(COL_STORM_ID)),
                    stormName = c.getString(c.getColumnIndexOrThrow(COL_STORM_NAME)),
                    severityCode = c.getString(c.getColumnIndexOrThrow(COL_SEVERITY)),
                    title = c.getString(c.getColumnIndexOrThrow(COL_TITLE)),
                    message = c.getString(c.getColumnIndexOrThrow(COL_MESSAGE)),
                    createdAt = c.getString(c.getColumnIndexOrThrow(COL_CREATED_AT)),
                    expiresAt = c.getString(c.getColumnIndexOrThrow(COL_EXPIRES_AT)),
                    sourceCode = c.getString(c.getColumnIndexOrThrow(COL_SOURCE)),
                    sourceModule = c.getString(c.getColumnIndexOrThrow(COL_SOURCE_MODULE)),
                    locationRegion = c.getString(c.getColumnIndexOrThrow(COL_LOCATION_REGION)),
                    latitude = if (c.isNull(c.getColumnIndexOrThrow(COL_LATITUDE))) null else c.getDouble(c.getColumnIndexOrThrow(COL_LATITUDE)),
                    longitude = if (c.isNull(c.getColumnIndexOrThrow(COL_LONGITUDE))) null else c.getDouble(c.getColumnIndexOrThrow(COL_LONGITUDE)),
                    radiusKm = if (c.isNull(c.getColumnIndexOrThrow(COL_RADIUS_KM))) null else c.getDouble(c.getColumnIndexOrThrow(COL_RADIUS_KM)),
                    isRead = c.getInt(c.getColumnIndexOrThrow(COL_IS_READ)) == 1,
                    isAcknowledged = c.getInt(c.getColumnIndexOrThrow(COL_IS_ACKNOWLEDGED)) == 1
                )
            }
        }
        return null
    }

    @Synchronized
    fun markAlertAsRead(alertId: String) {
        val db = writableDatabase
        val values = ContentValues().apply { put(COL_IS_READ, 1) }
        db.update(TABLE_ALERTS, values, "$COL_ALERT_ID = ?", arrayOf(alertId))
    }

    @Synchronized
    fun markAlertAsAcknowledged(alertId: String) {
        val db = writableDatabase
        val values = ContentValues().apply { 
            put(COL_IS_READ, 1)
            put(COL_IS_ACKNOWLEDGED, 1) 
        }
        db.update(TABLE_ALERTS, values, "$COL_ALERT_ID = ?", arrayOf(alertId))
    }

    // Convenience aliases for repository
    fun insertOrUpdateAlert(alert: VayuAlert) = upsertAlert(alert)
    fun insertOrUpdateAlerts(alerts: List<VayuAlert>) {
        alerts.forEach { upsertAlert(it) }
    }
    fun getAllAlerts(): List<VayuAlert> = getAllCachedAlerts()
    fun acknowledgeAlert(alertId: String) = markAlertAsAcknowledged(alertId)
}
