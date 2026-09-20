package live.vayusat.alerts.data.remote

import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import live.vayusat.alerts.data.model.DeviceRegistrationRequest
import live.vayusat.alerts.data.model.DeviceRegistrationResponse
import live.vayusat.alerts.data.model.NotificationPreferences
import live.vayusat.alerts.data.model.NotificationPreferencesUpdate
import live.vayusat.alerts.data.model.VayuAlert
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Clean HTTP client for the VAYU Alerts backend API (/api/notifications and /api/alerts).
 * Communicates with the FastAPI backend without requiring external heavyweight frameworks.
 */
class VayuApiService(
    private val baseUrl: String = DEFAULT_BASE_URL,
    private val okHttpClient: OkHttpClient = createDefaultOkHttpClient()
) {

    private val moshi: Moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun registerDevice(request: DeviceRegistrationRequest): Result<DeviceRegistrationResponse> =
        withContext(Dispatchers.IO) {
            try {
                val adapter = moshi.adapter(DeviceRegistrationRequest::class.java)
                val responseAdapter = moshi.adapter(DeviceRegistrationResponse::class.java)
                val jsonBody = adapter.toJson(request)

                val httpRequest = Request.Builder()
                    .url("$baseUrl/api/notifications/devices/register")
                    .post(jsonBody.toRequestBody(jsonMediaType))
                    .build()

                okHttpClient.newCall(httpRequest).execute().use { response ->
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(
                            IOException("Device registration failed with HTTP ${response.code}")
                        )
                    }
                    val bodyString = response.body?.string() ?: ""
                    val parsed = responseAdapter.fromJson(bodyString)
                        ?: return@withContext Result.failure(IOException("Empty registration response"))
                    Result.success(parsed)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun unregisterDevice(token: String, deviceId: String?): Result<Boolean> =
        withContext(Dispatchers.IO) {
            try {
                val payload = buildMap {
                    put("fcm_token", token)
                    deviceId?.let { put("device_id", it) }
                }
                val mapAdapter = moshi.adapter<Map<String, String>>(
                    Types.newParameterizedType(Map::class.java, String::class.java, String::class.java)
                )
                val httpRequest = Request.Builder()
                    .url("$baseUrl/api/notifications/devices/unregister")
                    .post(mapAdapter.toJson(payload).toRequestBody(jsonMediaType))
                    .build()

                okHttpClient.newCall(httpRequest).execute().use { response ->
                    Result.success(response.isSuccessful)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun fetchPreferences(deviceId: String): Result<NotificationPreferences> =
        withContext(Dispatchers.IO) {
            try {
                val adapter = moshi.adapter(NotificationPreferences::class.java)
                val httpRequest = Request.Builder()
                    .url("$baseUrl/api/notifications/preferences?device_id=$deviceId")
                    .get()
                    .build()

                okHttpClient.newCall(httpRequest).execute().use { response ->
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(IOException("Preferences query failed HTTP ${response.code}"))
                    }
                    val bodyString = response.body?.string() ?: ""
                    val parsed = adapter.fromJson(bodyString)
                        ?: return@withContext Result.failure(IOException("Empty preferences payload"))
                    Result.success(parsed)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun updatePreferences(update: NotificationPreferencesUpdate): Result<NotificationPreferences> =
        withContext(Dispatchers.IO) {
            try {
                val updateAdapter = moshi.adapter(NotificationPreferencesUpdate::class.java)
                val responseAdapter = moshi.adapter(NotificationPreferences::class.java)
                val httpRequest = Request.Builder()
                    .url("$baseUrl/api/notifications/preferences")
                    .put(updateAdapter.toJson(update).toRequestBody(jsonMediaType))
                    .build()

                okHttpClient.newCall(httpRequest).execute().use { response ->
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(IOException("Preferences update failed HTTP ${response.code}"))
                    }
                    val bodyString = response.body?.string() ?: ""
                    val parsed = responseAdapter.fromJson(bodyString)
                        ?: return@withContext Result.failure(IOException("Empty preferences response"))
                    Result.success(parsed)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun fetchAlerts(
        severity: String? = null,
        stormId: String? = null,
        limit: Int = 30
    ): Result<List<VayuAlert>> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = StringBuilder("$baseUrl/api/alerts?limit=$limit")
            severity?.let { urlBuilder.append("&severity=$it") }
            stormId?.let { urlBuilder.append("&storm_id=$it") }

            val httpRequest = Request.Builder()
                .url(urlBuilder.toString())
                .get()
                .build()

            okHttpClient.newCall(httpRequest).execute().use { response ->
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Fetch alerts failed with HTTP ${response.code}"))
                }
                val bodyString = response.body?.string() ?: "[]"
                val listType = Types.newParameterizedType(List::class.java, VayuAlert::class.java)
                val listAdapter = moshi.adapter<List<VayuAlert>>(listType)
                val alerts = listAdapter.fromJson(bodyString) ?: emptyList()
                Result.success(alerts)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun fetchAlertById(alertId: String): Result<VayuAlert> =
        withContext(Dispatchers.IO) {
            try {
                val adapter = moshi.adapter(VayuAlert::class.java)
                val httpRequest = Request.Builder()
                    .url("$baseUrl/api/alerts/$alertId")
                    .get()
                    .build()

                okHttpClient.newCall(httpRequest).execute().use { response ->
                    if (response.code == 404) {
                        return@withContext Result.failure(NoSuchElementException("Alert $alertId not found"))
                    }
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(IOException("Fetch alert failed HTTP ${response.code}"))
                    }
                    val bodyString = response.body?.string() ?: ""
                    val parsed = adapter.fromJson(bodyString)
                        ?: return@withContext Result.failure(IOException("Empty alert response"))
                    Result.success(parsed)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    companion object {
        // Default URL points to local emulator host mapping (10.0.2.2 points to 127.0.0.1 on the dev machine)
        const val DEFAULT_BASE_URL = "http://10.0.2.2:8000"

        fun createDefaultOkHttpClient(): OkHttpClient {
            return OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .retryOnConnectionFailure(true)
                .build()
        }
    }
}
