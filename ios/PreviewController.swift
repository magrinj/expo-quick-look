import QuickLook

class PreviewController: QLPreviewController {
    var previewDataSource: PreviewDataSource? {
        didSet {
            dataSource = previewDataSource
        }
    }
}
