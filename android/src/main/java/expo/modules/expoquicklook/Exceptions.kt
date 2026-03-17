package expo.modules.expoquicklook

import expo.modules.kotlin.exception.CodedException

class MissingCurrentActivityException : CodedException("Current activity not found")

class FileNotFoundException(path: String) : CodedException("File not found at path: $path")

class NetworkException(detail: String) : CodedException("Network error: $detail")

class DownloadTimeoutException : CodedException("Download timed out after 30 seconds")
