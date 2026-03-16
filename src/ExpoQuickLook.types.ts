export type EditingMode = 'disabled' | 'createCopy' | 'updateContents';

export type PreviewFileOptions = {
  filePath: string;
  /** @platform android */
  chooserTitle?: string;
  /** @platform ios */
  editingMode?: EditingMode;
};

export type PreviewFilesOptions = {
  filePaths: string[];
  initialIndex?: number;
  editingMode?: EditingMode;
};

export type ThumbnailOptions = {
  filePath: string;
  size: { width: number; height: number };
  scale?: number;
};

export type ThumbnailResult = {
  uri: string;
  width: number;
  height: number;
};

export type DismissEvent = object;

export type EditedFileEvent = {
  filePath: string;
};

export type SavedEditedCopyEvent = {
  originalPath: string;
  editedPath: string;
};
