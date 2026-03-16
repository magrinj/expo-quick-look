import QuickLook

class PreviewDataSource: QLPreviewControllerDataSource {
    private let items: [URL]

    init(items: [URL]) {
        self.items = items
    }

    convenience init(item: URL) {
        self.init(items: [item])
    }

    func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
        return items.count
    }

    func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        return items[index] as QLPreviewItem
    }
}
