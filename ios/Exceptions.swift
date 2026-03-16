import ExpoModulesCore

internal final class MissingCurrentViewControllerException: Exception {
    override var reason: String {
        "Cannot determine currently presented view controller"
    }
}

internal final class FileNotFoundException: Exception {
    private let path: String

    init(path: String) {
        self.path = path
        super.init()
    }

    override var reason: String {
        "File does not exist at path: \(path)"
    }
}

internal final class InvalidFileURLException: Exception {
    private let path: String

    init(path: String) {
        self.path = path
        super.init()
    }

    override var reason: String {
        "Invalid file URL: \(path)"
    }
}

internal final class EmptyFileListException: Exception {
    override var reason: String {
        "File list must not be empty"
    }
}

internal final class ThumbnailGenerationException: Exception {
    private let path: String

    init(path: String) {
        self.path = path
        super.init()
    }

    override var reason: String {
        "Failed to generate thumbnail for file: \(path)"
    }
}
