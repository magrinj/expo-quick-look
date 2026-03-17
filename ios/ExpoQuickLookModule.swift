import ExpoModulesCore
import QuickLook
import UIKit

struct PreviewOptions: Record {
    @Field var filePath: String
    @Field var editingMode: String?
}

struct MultiPreviewOptions: Record {
    @Field var filePaths: [String]
    @Field var initialIndex: Int?
    @Field var editingMode: String?
}

public class ExpoQuickLookModule: Module {
    private var activeContinuation: CheckedContinuation<Void, Error>?
    private var activeDelegate: PreviewDelegate?
    private var activeController: PreviewController?
    private var tempFiles: [URL] = []

    public func definition() -> ModuleDefinition {
        Name("ExpoQuickLook")

        Events("onDismiss", "onEditedFile", "onSavedEditedCopy")

        AsyncFunction("previewFile") { (options: PreviewOptions, promise: Promise) in
            Task {
                do {
                    let fileURL: URL
                    if self.isRemoteURL(options.filePath) {
                        guard let remoteURL = URL(string: options.filePath) else {
                            throw InvalidFileURLException(path: options.filePath)
                        }
                        fileURL = try await self.downloadToTempFile(from: remoteURL)
                        self.tempFiles.append(fileURL)
                    } else {
                        fileURL = try self.resolveFileURL(options.filePath)
                    }
                    let editing = self.resolveEditingMode(options.editingMode)
                    try await self.presentPreview(items: [fileURL], startIndex: 0, editingMode: editing)
                    self.cleanupTempFiles()
                    promise.resolve()
                } catch {
                    self.cleanupTempFiles()
                    promise.reject(error)
                }
            }
        }

        AsyncFunction("previewFiles") { (options: MultiPreviewOptions, promise: Promise) in
            Task {
                do {
                    guard !options.filePaths.isEmpty else {
                        throw EmptyFileListException()
                    }

                    var fileURLs: [URL] = []
                    for path in options.filePaths {
                        if self.isRemoteURL(path) {
                            guard let remoteURL = URL(string: path) else {
                                throw InvalidFileURLException(path: path)
                            }
                            let localURL = try await self.downloadToTempFile(from: remoteURL)
                            self.tempFiles.append(localURL)
                            fileURLs.append(localURL)
                        } else {
                            fileURLs.append(try self.resolveFileURL(path))
                        }
                    }

                    let startAt = min(max(options.initialIndex ?? 0, 0), fileURLs.count - 1)
                    let editing = self.resolveEditingMode(options.editingMode)
                    try await self.presentPreview(items: fileURLs, startIndex: startAt, editingMode: editing)
                    self.cleanupTempFiles()
                    promise.resolve()
                } catch {
                    self.cleanupTempFiles()
                    promise.reject(error)
                }
            }
        }

        AsyncFunction("canPreview") { (filePath: String, promise: Promise) in
            Task {
                do {
                    if self.isRemoteURL(filePath) {
                        guard let url = URL(string: filePath),
                              let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
                            promise.resolve(false)
                            return
                        }
                        let ext = (components.path as NSString).pathExtension.lowercased()
                        promise.resolve(!ext.isEmpty)
                    } else {
                        let fileURL = try self.resolveFileURL(filePath)
                        let result = QLPreviewController.canPreview(fileURL as QLPreviewItem)
                        promise.resolve(result)
                    }
                } catch {
                    promise.reject(error)
                }
            }
        }

        AsyncFunction("generateThumbnail") { (options: ThumbnailOptions, promise: Promise) in
            Task {
                do {
                    if self.isRemoteURL(options.filePath) {
                        throw RemoteURLNotSupportedException(feature: "generateThumbnail")
                    }

                    let fileURL = try self.resolveFileURL(options.filePath)
                    let w = options.size["width"] ?? 200
                    let h = options.size["height"] ?? 200
                    let s = options.scale ?? Double(UIScreen.main.scale)

                    let result = try await ThumbnailGenerator.generate(
                        fileURL: fileURL,
                        width: w,
                        height: h,
                        scale: s
                    )

                    promise.resolve([
                        "uri": result.uri,
                        "width": result.width,
                        "height": result.height
                    ])
                } catch {
                    promise.reject(error)
                }
            }
        }
    }

    private func isRemoteURL(_ path: String) -> Bool {
        path.hasPrefix("http://") || path.hasPrefix("https://")
    }

    private func resolveFileURL(_ path: String) throws -> URL {
        let fileURL: URL
        if path.hasPrefix("file://") {
            guard let parsed = URL(string: path) else {
                throw InvalidFileURLException(path: path)
            }
            fileURL = parsed
        } else {
            fileURL = URL(fileURLWithPath: path)
        }

        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            throw FileNotFoundException(path: fileURL.path)
        }

        return fileURL
    }

    private func downloadToTempFile(from url: URL) async throws -> URL {
        var request = URLRequest(url: url)
        request.timeoutInterval = 30

        let (tempURL, response): (URL, URLResponse)
        do {
            (tempURL, response) = try await URLSession.shared.download(for: request)
        } catch let error as URLError where error.code == .timedOut {
            throw DownloadTimeoutException()
        } catch {
            throw NetworkException(detail: error.localizedDescription)
        }

        if let httpResponse = response as? HTTPURLResponse,
           !(200...299).contains(httpResponse.statusCode) {
            throw NetworkException(detail: "HTTP \(httpResponse.statusCode)")
        }

        let filename: String
        if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
           let lastPath = components.path.split(separator: "/").last {
            filename = String(lastPath)
        } else {
            filename = url.lastPathComponent
        }

        let destURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathComponent(filename)

        try FileManager.default.createDirectory(
            at: destURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try FileManager.default.moveItem(at: tempURL, to: destURL)

        return destURL
    }

    private func cleanupTempFiles() {
        for file in tempFiles {
            try? FileManager.default.removeItem(at: file.deletingLastPathComponent())
        }
        tempFiles = []
    }

    private func resolveEditingMode(_ mode: String?) -> QLPreviewItemEditingMode {
        switch mode {
        case "createCopy":
            return .createCopy
        case "updateContents":
            return .updateContents
        default:
            return .disabled
        }
    }

    @MainActor
    private func presentPreview(items: [URL], startIndex: Int, editingMode: QLPreviewItemEditingMode) async throws {
        guard let viewController = self.appContext?.utilities?.currentViewController() else {
            throw MissingCurrentViewControllerException()
        }

        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            self.activeContinuation = continuation

            let delegate = PreviewDelegate()
            delegate.editingMode = editingMode
            delegate.onDismiss = { [weak self] in
                self?.sendEvent("onDismiss", [:])
                self?.activeContinuation?.resume(returning: ())
                self?.activeContinuation = nil
                self?.activeDelegate = nil
                self?.activeController = nil
            }
            delegate.onEditedFile = { [weak self] filePath in
                self?.sendEvent("onEditedFile", ["filePath": filePath])
            }
            delegate.onSavedEditedCopy = { [weak self] originalPath, editedPath in
                self?.sendEvent("onSavedEditedCopy", [
                    "originalPath": originalPath,
                    "editedPath": editedPath
                ])
            }
            self.activeDelegate = delegate

            let source = PreviewDataSource(items: items)
            let controller = PreviewController()
            controller.previewDataSource = source
            controller.delegate = delegate
            controller.currentPreviewItemIndex = startIndex
            self.activeController = controller

            viewController.present(controller, animated: true)
        }
    }
}
