import ExpoModulesCore
import QuickLook
import UIKit
import UniformTypeIdentifiers

struct RequestOptions: Record {
    @Field var headers: [String: String]?
}

struct PreviewOptions: Record {
    @Field var uri: String
    @Field var requestOptions: RequestOptions?
    @Field var editingMode: String?
}

struct MultiPreviewOptions: Record {
    @Field var uris: [String]
    @Field var requestOptions: RequestOptions?
    @Field var initialIndex: Int?
    @Field var editingMode: String?
}

public class ExpoQuickLookModule: Module {
    private var activeContinuation: CheckedContinuation<Void, Error>?
    private var activeDelegate: PreviewDelegate?
    private var activeController: PreviewController?

    public func definition() -> ModuleDefinition {
        Name("ExpoQuickLook")

        OnCreate {
            self.cleanupCacheDirectory()
        }

        Events("onDismiss", "onEditedFile", "onSavedEditedCopy")

        AsyncFunction("previewFile") { (options: PreviewOptions, promise: Promise) in
            Task {
                var localFiles: [URL] = []
                do {
                    let fileURL: URL
                    if self.isRemoteURL(options.uri) {
                        guard let remoteURL = URL(string: options.uri) else {
                            throw InvalidFileURLException(path: options.uri)
                        }
                        fileURL = try await self.downloadToTempFile(from: remoteURL, headers: options.requestOptions?.headers)
                        localFiles.append(fileURL)
                    } else {
                        fileURL = try self.resolveFileURL(options.uri)
                    }
                    let editing = self.resolveEditingMode(options.editingMode)
                    let item = PreviewItem(url: fileURL)
                    try await self.presentPreview(items: [item], startIndex: 0, editingMode: editing)
                    Self.cleanupFiles(localFiles)
                    promise.resolve()
                } catch {
                    Self.cleanupFiles(localFiles)
                    promise.reject(error)
                }
            }
        }

        AsyncFunction("previewFiles") { (options: MultiPreviewOptions, promise: Promise) in
            Task {
                var localFiles: [URL] = []
                do {
                    guard !options.uris.isEmpty else {
                        throw EmptyFileListException()
                    }

                    var previewItems: [PreviewItem] = []
                    for path in options.uris {
                        if self.isRemoteURL(path) {
                            guard let remoteURL = URL(string: path) else {
                                throw InvalidFileURLException(path: path)
                            }
                            let localURL = try await self.downloadToTempFile(from: remoteURL, headers: options.requestOptions?.headers)
                            localFiles.append(localURL)
                            previewItems.append(PreviewItem(url: localURL))
                        } else {
                            previewItems.append(PreviewItem(url: try self.resolveFileURL(path)))
                        }
                    }

                    let startAt = min(max(options.initialIndex ?? 0, 0), previewItems.count - 1)
                    let editing = self.resolveEditingMode(options.editingMode)
                    try await self.presentPreview(items: previewItems, startIndex: startAt, editingMode: editing)
                    Self.cleanupFiles(localFiles)
                    promise.resolve()
                } catch {
                    Self.cleanupFiles(localFiles)
                    promise.reject(error)
                }
            }
        }

        AsyncFunction("canPreview") { (uri: String, promise: Promise) in
            Task {
                do {
                    if self.isRemoteURL(uri) {
                        guard let url = URL(string: uri),
                              let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
                            promise.resolve(false)
                            return
                        }
                        let ext = (components.path as NSString).pathExtension.lowercased()
                        promise.resolve(!ext.isEmpty)
                    } else {
                        let fileURL = try self.resolveFileURL(uri)
                        let result = await MainActor.run {
                            QLPreviewController.canPreview(fileURL as QLPreviewItem)
                        }
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
                    if self.isRemoteURL(options.uri) {
                        throw RemoteURLNotSupportedException(feature: "generateThumbnail")
                    }

                    let fileURL = try self.resolveFileURL(options.uri)
                    let w = options.size["width"] ?? 200
                    let h = options.size["height"] ?? 200
                    let s: Double
                    if let scale = options.scale {
                        s = scale
                    } else {
                        s = await Double(UIScreen.main.scale)
                    }

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

    private func downloadToTempFile(from url: URL, headers: [String: String]?) async throws -> URL {
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        if let headers = headers {
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }

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

        let resolvedName = Self.resolveFilename(from: url, response: response)
        let ext = (resolvedName as NSString).pathExtension
        let filename = ext.isEmpty ? UUID().uuidString : "\(UUID().uuidString).\(ext)"

        // Use Caches directory instead of tmp — QLPreviewController's preview
        // extension (separate process) has known issues accessing tmp files.
        let cachesURL = try FileManager.default.url(
            for: .cachesDirectory, in: .userDomainMask,
            appropriateFor: nil, create: true
        )
        let cacheDir = cachesURL.appendingPathComponent("expo-quick-look", isDirectory: true)
        try FileManager.default.createDirectory(at: cacheDir, withIntermediateDirectories: true)
        let destURL = cacheDir.appendingPathComponent(filename, isDirectory: false)
        try FileManager.default.moveItem(at: tempURL, to: destURL)

        return destURL
    }

    private static func resolveFilename(from url: URL, response: URLResponse) -> String {
        // 1. Try suggested filename from the response (Content-Disposition header)
        //    URLSession parses this for us — most reliable source.
        if let suggested = response.suggestedFilename,
           (suggested as NSString).pathExtension.isEmpty == false {
            return suggested
        }

        // 2. Try the URL path's last component if it has an extension
        if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
           let lastPath = components.path.split(separator: "/").last {
            let name = String(lastPath)
            if (name as NSString).pathExtension.isEmpty == false {
                return name
            }
        }

        // 3. Infer extension from Content-Type via MIME type
        let baseName: String = {
            if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
               let lastPath = components.path.split(separator: "/").last,
               !String(lastPath).isEmpty {
                return String(lastPath)
            }
            return "document"
        }()

        if let mimeType = response.mimeType,
           let uti = UTType(mimeType: mimeType),
           let ext = uti.preferredFilenameExtension {
            return "\(baseName).\(ext)"
        }

        // 4. Fallback — no extension, but at least a name
        return baseName
    }

    private static func cleanupFiles(_ files: [URL]) {
        for file in files {
            try? FileManager.default.removeItem(at: file)
        }
    }

    /// Removes all cached download files on module init
    private func cleanupCacheDirectory() {
        guard let cachesURL = try? FileManager.default.url(
            for: .cachesDirectory, in: .userDomainMask,
            appropriateFor: nil, create: false
        ) else { return }
        let cacheDir = cachesURL.appendingPathComponent("expo-quick-look")
        try? FileManager.default.removeItem(at: cacheDir)
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
    private func presentPreview(items: [PreviewItem], startIndex: Int, editingMode: QLPreviewItemEditingMode) async throws {
        // Dismiss any existing preview and wait for it to fully complete
        if let existingController = self.activeController {
            self.activeContinuation?.resume(returning: ())
            self.activeContinuation = nil
            self.activeDelegate = nil
            self.activeController = nil
            await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
                existingController.dismiss(animated: false) {
                    cont.resume()
                }
            }
        }

        guard let viewController = self.appContext?.utilities?.currentViewController() else {
            throw MissingCurrentViewControllerException()
        }

        // If another view controller is still being dismissed, wait for that too
        if viewController.presentedViewController != nil {
            await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
                viewController.dismiss(animated: false) {
                    cont.resume()
                }
            }
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
