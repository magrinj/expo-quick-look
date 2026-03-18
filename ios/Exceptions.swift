import ExpoModulesCore

internal final class MissingCurrentViewControllerException: Exception, @unchecked Sendable {
    override var reason: String {
        "Cannot determine currently presented view controller"
    }
}

internal final class FileNotFoundException: Exception, @unchecked Sendable {
    private let path: String

    init(path: String) {
        self.path = path
        super.init()
    }

    override var reason: String {
        "File does not exist at path: \(path)"
    }
}

internal final class InvalidFileURLException: Exception, @unchecked Sendable {
    private let path: String

    init(path: String) {
        self.path = path
        super.init()
    }

    override var reason: String {
        "Invalid file URL: \(path)"
    }
}

internal final class EmptyFileListException: Exception, @unchecked Sendable {
    override var reason: String {
        "File list must not be empty"
    }
}

internal final class ThumbnailGenerationException: Exception, @unchecked Sendable {
    private let path: String

    init(path: String) {
        self.path = path
        super.init()
    }

    override var reason: String {
        "Failed to generate thumbnail for file: \(path)"
    }
}

internal final class NetworkException: Exception, @unchecked Sendable {
    private let detail: String

    init(detail: String) {
        self.detail = detail
        super.init()
    }

    override var reason: String {
        "Network error: \(detail)"
    }
}

internal final class DownloadTimeoutException: Exception, @unchecked Sendable {
    override var reason: String {
        "Download timed out after 30 seconds"
    }
}

internal final class RemoteURLNotSupportedException: Exception, @unchecked Sendable {
    private let feature: String

    init(feature: String) {
        self.feature = feature
        super.init()
    }

    override var reason: String {
        "\(feature) does not support remote URLs. Download the file locally first."
    }
}
