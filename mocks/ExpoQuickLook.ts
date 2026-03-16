const ExpoQuickLook = {
  previewFile: jest.fn(async (): Promise<void> => {}),
  previewFiles: jest.fn(async (): Promise<void> => {}),
  canPreview: jest.fn(async (): Promise<boolean> => true),
  generateThumbnail: jest.fn(async () => ({ uri: "", width: 0, height: 0 })),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
};

export default ExpoQuickLook;
