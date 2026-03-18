import QuickLook
import ExpoModulesCore

struct ThumbnailOptions: Record {
    @Field var uri: String
    @Field var size: [String: Double]
    @Field var scale: Double?
}

class ThumbnailGenerator {
    static func generate(
        fileURL: URL,
        width: Double,
        height: Double,
        scale: Double
    ) async throws -> (uri: String, width: Int, height: Int) {
        let size = CGSize(width: width, height: height)
        let request = QLThumbnailGenerator.Request(
            fileAt: fileURL,
            size: size,
            scale: CGFloat(scale),
            representationTypes: .thumbnail
        )

        let representation = try await QLThumbnailGenerator.shared.generateBestRepresentation(for: request)

        let image = representation.uiImage
        guard let pngData = image.pngData() else {
            throw ThumbnailGenerationException(path: fileURL.path)
        }

        let tempDir = FileManager.default.temporaryDirectory
        let fileName = "\(UUID().uuidString).png"
        let outputURL = tempDir.appendingPathComponent(fileName)
        try pngData.write(to: outputURL)

        return (
            uri: outputURL.absoluteString,
            width: Int(image.size.width * image.scale),
            height: Int(image.size.height * image.scale)
        )
    }
}
