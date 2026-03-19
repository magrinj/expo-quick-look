package expo.modules.expoquicklook

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.webkit.MimeTypeMap
import androidx.core.content.FileProvider
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.toCodedException
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLConnection

data class RequestOptions(
    @Field val headers: Map<String, String>? = null
) : Record

data class PreviewOptions(
    @Field val uri: String,
    @Field val requestOptions: RequestOptions? = null,
    @Field val chooserTitle: String = "Open file with"
) : Record

class ExpoQuickLookModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoQuickLook")

        AsyncFunction("previewFile") { options: PreviewOptions, promise: Promise ->
            try {
                val activity = appContext.currentActivity
                    ?: throw MissingCurrentActivityException()

                val targetFile: File = if (isRemoteURL(options.uri)) {
                    downloadToCache(options.uri, options.requestOptions?.headers)
                } else {
                    val resolvedPath = Uri.decode(options.uri.removePrefix("file://"))
                    val file = File(resolvedPath)
                    if (!file.exists()) {
                        throw FileNotFoundException(file.absolutePath)
                    }
                    file
                }

                val resolvedMimeType = resolveMimeType(targetFile)

                val contentUri = FileProvider.getUriForFile(
                    activity,
                    "${activity.packageName}.ExpoQuickLookFileProvider",
                    targetFile
                )

                val viewIntent = Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(contentUri, resolvedMimeType)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val chooser = Intent.createChooser(viewIntent, options.chooserTitle)
                activity.startActivity(chooser)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject(e.toCodedException())
            }
        }

        AsyncFunction("canPreview") { uri: String, promise: Promise ->
            try {
                val activity = appContext.currentActivity
                    ?: throw MissingCurrentActivityException()

                val resolvedMimeType: String = if (isRemoteURL(uri)) {
                    val urlPath = URL(uri).path ?: ""
                    val filename = urlPath.substringAfterLast("/")
                    val ext = filename.substringAfterLast(".", "").lowercase()
                    if (ext.isEmpty()) {
                        promise.resolve(false)
                        return@AsyncFunction
                    }
                    MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
                } else {
                    val resolvedPath = Uri.decode(uri.removePrefix("file://"))
                    val targetFile = File(resolvedPath)
                    resolveMimeType(targetFile)
                }

                val checkIntent = Intent(Intent.ACTION_VIEW).apply {
                    setType(resolvedMimeType)
                }
                val handlers = activity.packageManager.queryIntentActivities(
                    checkIntent,
                    PackageManager.MATCH_DEFAULT_ONLY
                )
                promise.resolve(handlers.isNotEmpty())
            } catch (e: Exception) {
                promise.reject(e.toCodedException())
            }
        }
    }

    private fun isRemoteURL(path: String): Boolean {
        return path.startsWith("http://") || path.startsWith("https://")
    }

    private fun downloadToCache(urlString: String, headers: Map<String, String>? = null): File {
        val url = URL(urlString)
        val connection = url.openConnection() as HttpURLConnection
        connection.connectTimeout = 30_000
        connection.readTimeout = 30_000
        connection.instanceFollowRedirects = true
        headers?.forEach { (key, value) -> connection.setRequestProperty(key, value) }

        try {
            val responseCode = connection.responseCode
            if (responseCode !in 200..299) {
                throw NetworkException("HTTP $responseCode")
            }

            val filename = resolveFilename(url, connection)

            val context = appContext.reactContext ?: throw MissingCurrentActivityException()
            val cacheDir = File(context.cacheDir, "expo-quick-look")
            cacheDir.mkdirs()
            val destFile = File(cacheDir, "${System.currentTimeMillis()}_$filename")

            connection.inputStream.use { input ->
                FileOutputStream(destFile).use { output ->
                    input.copyTo(output)
                }
            }

            return destFile
        } catch (e: java.net.SocketTimeoutException) {
            throw DownloadTimeoutException()
        } catch (e: java.io.IOException) {
            throw NetworkException(e.message ?: "Download failed")
        } finally {
            connection.disconnect()
        }
    }

    private fun resolveFilename(url: URL, connection: HttpURLConnection): String {
        val urlPath = url.path ?: ""
        val lastSegment = urlPath.substringAfterLast("/").ifEmpty { "document" }

        // 1. Try Content-Disposition header for a filename (most reliable)
        val disposition = connection.getHeaderField("Content-Disposition")
        if (disposition != null) {
            val match = Regex("""filename\*?=(?:UTF-8''|"?)([^";]+)"?""", RegexOption.IGNORE_CASE)
                .find(disposition)
            if (match != null) {
                val name = match.groupValues[1].trim()
                if (name.isNotEmpty() && name.contains(".")) return name
            }
        }

        // 2. URL path has an extension — use it directly
        val urlExt = lastSegment.substringAfterLast(".", "").lowercase()
        if (urlExt.isNotEmpty() && urlExt != lastSegment.lowercase()) {
            return lastSegment
        }

        // 3. Infer extension from Content-Type
        val contentType = connection.contentType
        if (contentType != null) {
            val mimeBase = contentType.substringBefore(";").trim()
            val ext = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeBase)
            if (ext != null) {
                return "$lastSegment.$ext"
            }
        }

        // 4. Fallback
        return lastSegment
    }

    private fun resolveMimeType(targetFile: File): String {
        val ext = targetFile.extension.lowercase()
        var mime: String? = if (ext.isNotEmpty()) {
            MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext)
        } else {
            null
        }

        if (mime == null || mime == "application/octet-stream") {
            try {
                FileInputStream(targetFile).use { stream ->
                    mime = URLConnection.guessContentTypeFromStream(stream)
                }
            } catch (_: Exception) {}
        }

        return mime ?: "application/octet-stream"
    }
}
