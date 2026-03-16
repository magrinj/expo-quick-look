import QuickLook

class PreviewDelegate: NSObject, QLPreviewControllerDelegate {
    var editingMode: QLPreviewItemEditingMode = .disabled
    var onDismiss: (() -> Void)?
    var onEditedFile: ((_ filePath: String) -> Void)?
    var onSavedEditedCopy: ((_ originalPath: String, _ editedPath: String) -> Void)?

    func previewControllerDidDismiss(_ controller: QLPreviewController) {
        onDismiss?()
    }

    func previewController(
        _ controller: QLPreviewController,
        editingModeFor previewItem: QLPreviewItem
    ) -> QLPreviewItemEditingMode {
        return editingMode
    }

    func previewController(
        _ controller: QLPreviewController,
        didUpdateContentsOf previewItem: QLPreviewItem
    ) {
        guard let url = previewItem.previewItemURL else { return }
        onEditedFile?(url.path)
    }

    func previewController(
        _ controller: QLPreviewController,
        didSaveEditedCopyOf previewItem: QLPreviewItem,
        at modifiedContentsURL: URL
    ) {
        let original = (previewItem.previewItemURL ?? URL(fileURLWithPath: "")).path
        onSavedEditedCopy?(original, modifiedContentsURL.path)
    }
}
