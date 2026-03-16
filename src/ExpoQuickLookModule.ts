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

declare class ExpoQuickLookModule extends NativeModule<{
  onDismiss: (event: DismissEvent) => void;
  onEditedFile: (event: EditedFileEvent) => void;
  onSavedEditedCopy: (event: SavedEditedCopyEvent) => void;
}> {
  previewFile(options: PreviewFileOptions): Promise<void>;
  /** @platform ios */
  previewFiles(options: PreviewFilesOptions): Promise<void>;
  canPreview(filePath: string): Promise<boolean>;
  /** @platform ios */
  generateThumbnail(options: ThumbnailOptions): Promise<ThumbnailResult>;
}

export default requireNativeModule<ExpoQuickLookModule>("ExpoQuickLook");
