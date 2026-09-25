import { NativeModule, registerWebModule } from "expo";
import { UnavailabilityError } from "expo-modules-core";

import type {
  PreviewFileOptions,
  PreviewFilesOptions,
  ThumbnailOptions,
  ThumbnailResult,
  WillDismissEvent,
  DismissEvent,
  EditedFileEvent,
  SavedEditedCopyEvent,
} from "./ExpoQuickLook.types";

type ExpoQuickLookModuleEvents = {
  onWillDismiss: (event: WillDismissEvent) => void;
  onDismiss: (event: DismissEvent) => void;
  onEditedFile: (event: EditedFileEvent) => void;
  onSavedEditedCopy: (event: SavedEditedCopyEvent) => void;
};

/**
 * Web implementation of the Quick Look module.
 *
 * The browser has no native preview controller, so previews are delegated to the
 * browser itself by opening the file in a new tab. Dismissal/editing events never
 * fire on web; `addListener` is still safe to call and simply never receives them.
 */
class ExpoQuickLookModule extends NativeModule<ExpoQuickLookModuleEvents> {
  /** Opens the file in a new browser tab. `requestOptions.headers` are ignored on web. */
  async previewFile(options: PreviewFileOptions): Promise<void> {
    window.open(options.uri, "_blank", "noopener,noreferrer");
  }

  /**
   * Opens each file in its own browser tab. Note that browsers may block all but the
   * first tab unless the call originates from a direct user gesture.
   */
  async previewFiles(options: PreviewFilesOptions): Promise<void> {
    for (const uri of options.uris) {
      window.open(uri, "_blank", "noopener,noreferrer");
    }
  }

  /** Always `true` on web — the browser decides how to handle the URL. */
  async canPreview(_uri: string): Promise<boolean> {
    return true;
  }

  /** Not supported on web. */
  async generateThumbnail(
    _options: ThumbnailOptions,
  ): Promise<ThumbnailResult> {
    throw new UnavailabilityError("ExpoQuickLook", "generateThumbnail");
  }
}

export default registerWebModule(ExpoQuickLookModule, "ExpoQuickLook");
