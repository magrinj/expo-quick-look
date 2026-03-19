import QuickLook

class PreviewItem: NSObject, QLPreviewItem {
    let previewItemURL: URL?
    let previewItemTitle: String?

    init(url: URL, title: String? = nil) {
        self.previewItemURL = url
        self.previewItemTitle = title ?? url.deletingPathExtension().lastPathComponent
        super.init()
    }
}

class PreviewDataSource: QLPreviewControllerDataSource {
    private let items: [PreviewItem]

    init(items: [PreviewItem]) {
        self.items = items
    }

    func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
        return items.count
    }

    func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        return items[index]
    }
}
