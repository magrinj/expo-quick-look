package expo.modules.expoquicklook

import expo.modules.kotlin.exception.CodedException

class MissingCurrentActivityException : CodedException("Current activity not found")

class FileNotFoundException(path: String) : CodedException("File not found at path: $path")
