import { NativeModule, requireNativeModule } from "expo";

import type {
  PreviewFileOptions,
  PreviewFilesOptions,
  ThumbnailOptions,
  ThumbnailResult,
  DismissEvent,
  EditedFileEvent,
  SavedEditedCopyEvent,
} from "./ExpoQuickLook.types";

/**
 * Native module providing file preview and thumbnail generation capabilities.
 *
 * @example
 * ```ts
 * import ExpoQuickLook from '@magrinj/expo-quick-look';
 *
 * // Local file
 * await ExpoQuickLook.previewFile({ filePath: '/path/to/file.pdf' });
 *
 * // Remote URL
 * await ExpoQuickLook.previewFile({ filePath: 'https://example.com/doc.pdf' });
 * ```
 */
declare class ExpoQuickLookModule extends NativeModule<{
  /** Fired when the preview controller is dismissed. */
  onDismiss: (event: DismissEvent) => void;
  /** Fired when a file is edited in-place (editingMode: `'updateContents'`). */
  onEditedFile: (event: EditedFileEvent) => void;
  /** Fired when an edited copy is saved (editingMode: `'createCopy'`). */
  onSavedEditedCopy: (event: SavedEditedCopyEvent) => void;
}> {
  /**
   * Preview a single file. On Android this opens an intent chooser; on iOS it uses QLPreviewController.
   *
   * @param options - Local file path or remote URL, and platform-specific options.
   */
  previewFile(options: PreviewFileOptions): Promise<void>;
  /**
   * Preview multiple files with swipe navigation.
   *
   * @param options - File paths, initial index, and editing mode.
   * @platform ios
   */
  previewFiles(options: PreviewFilesOptions): Promise<void>;
  /**
   * Check whether a file can be previewed by the system.
   *
   * @param filePath - Local file path or remote URL.
   * @returns `true` if the file type is supported for preview.
   */
  canPreview(filePath: string): Promise<boolean>;
  /**
   * Generate a thumbnail image for a file.
   *
   * @param options - File path, desired size, and optional scale.
   * @returns URI, width, and height of the generated thumbnail.
   * @platform ios
   */
  generateThumbnail(options: ThumbnailOptions): Promise<ThumbnailResult>;
}

export default requireNativeModule<ExpoQuickLookModule>("ExpoQuickLook");
