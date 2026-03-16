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
import java.net.URLConnection

data class PreviewOptions(
    @Field val filePath: String,
    @Field val chooserTitle: String = "Open file with"
) : Record

class ExpoQuickLookModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoQuickLook")

        AsyncFunction("previewFile") { options: PreviewOptions, promise: Promise ->
            try {
                val activity = appContext.currentActivity
                    ?: throw MissingCurrentActivityException()

                val resolvedPath = Uri.decode(options.filePath.removePrefix("file://"))
                val targetFile = File(resolvedPath)

                if (!targetFile.exists()) {
                    throw FileNotFoundException(targetFile.absolutePath)
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

        AsyncFunction("canPreview") { filePath: String, promise: Promise ->
            try {
                val activity = appContext.currentActivity
                    ?: throw MissingCurrentActivityException()

                val resolvedPath = Uri.decode(filePath.removePrefix("file://"))
                val targetFile = File(resolvedPath)
                val resolvedMimeType = resolveMimeType(targetFile)

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
