/**
 * Controls whether and how the user can edit a previewed file.
 *
 * - `'disabled'` — editing is not allowed
 * - `'createCopy'` — edits are saved as a new copy of the file
 * - `'updateContents'` — edits overwrite the original file
 */
export type EditingMode = 'disabled' | 'createCopy' | 'updateContents';

/**
 * Options for previewing a single file.
 */
export type PreviewFileOptions = {
  /** Local file path or remote URL (`https://...`) of the file to preview. */
  filePath: string;
  /**
   * Title shown in the Android share/chooser sheet.
   * @platform android
   */
  chooserTitle?: string;
  /**
   * Controls whether the user can edit the file during preview.
   * @platform ios
   */
  editingMode?: EditingMode;
};

/**
 * Options for previewing multiple files with swipe navigation.
 * @platform ios
 */
export type PreviewFilesOptions = {
  /** Array of local file paths or remote URLs to preview. */
  filePaths: string[];
  /** Zero-based index of the file to show first. Defaults to `0`. */
  initialIndex?: number;
  /** Controls whether the user can edit files during preview. */
  editingMode?: EditingMode;
};

/**
 * Options for generating a thumbnail image of a file.
 * @platform ios
 */
export type ThumbnailOptions = {
  /** Absolute path to a local file to generate a thumbnail for. Remote URLs are not supported. */
  filePath: string;
  /** Desired thumbnail dimensions in points. */
  size: { width: number; height: number };
  /** Scale factor for the thumbnail (e.g. `2` for @2x). Defaults to the device scale. */
  scale?: number;
};

/**
 * Result returned after generating a thumbnail.
 * @platform ios
 */
export type ThumbnailResult = {
  /** Local URI of the generated thumbnail image. */
  uri: string;
  /** Actual width of the generated thumbnail in pixels. */
  width: number;
  /** Actual height of the generated thumbnail in pixels. */
  height: number;
};

/** Emitted when the Quick Look preview is dismissed. */
export type DismissEvent = object;

/** Emitted when a file is edited in-place during preview. */
export type EditedFileEvent = {
  /** Absolute path of the edited file. */
  filePath: string;
};

/** Emitted when an edited copy of a file is saved during preview. */
export type SavedEditedCopyEvent = {
  /** Absolute path of the original file. */
  originalPath: string;
  /** Absolute path of the newly created edited copy. */
  editedPath: string;
};
