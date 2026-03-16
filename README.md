# @magrinj/expo-quick-look

[![npm version](https://img.shields.io/npm/v/@magrinj/expo-quick-look.svg)](https://www.npmjs.com/package/@magrinj/expo-quick-look)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android-brightgreen)

A native Expo module for previewing files using QuickLook on iOS and system viewers on Android.

## Installation

```bash
npx expo install @magrinj/expo-quick-look
```

## API

### `previewFile(options: PreviewFileOptions): Promise<void>`

Opens a native file preview.

- **iOS:** Presents `QLPreviewController` modally. Promise resolves when the user dismisses the preview.
- **Android:** Launches an Intent chooser with `ACTION_VIEW`. Promise resolves immediately after launch.

```typescript
import ExpoQuickLook from '@magrinj/expo-quick-look';

await ExpoQuickLook.previewFile({
  filePath: '/path/to/file.pdf',
  // Android only
  chooserTitle: 'Open with',
  // iOS only - 'disabled' | 'createCopy' | 'updateContents'
  editingMode: 'createCopy',
});
```

### `previewFiles(options: PreviewFilesOptions): Promise<void>` *(iOS only)*

Opens a multi-file preview with swipe navigation.

```typescript
await ExpoQuickLook.previewFiles({
  filePaths: ['/path/to/file1.pdf', '/path/to/file2.png'],
  initialIndex: 0,
  editingMode: 'disabled',
});
```

### `canPreview(filePath: string): Promise<boolean>`

Checks whether a file can be previewed.

- **iOS:** Uses `QLPreviewController.canPreview`.
- **Android:** Checks if any installed app can handle the file's MIME type.

```typescript
const supported = await ExpoQuickLook.canPreview('/path/to/file.pdf');
```

### `generateThumbnail(options: ThumbnailOptions): Promise<ThumbnailResult>` *(iOS only)*

Generates a thumbnail for a file.

```typescript
const thumbnail = await ExpoQuickLook.generateThumbnail({
  filePath: '/path/to/file.pdf',
  size: { width: 200, height: 200 },
  scale: 2, // defaults to device scale
});
// thumbnail.uri - file:// URI to the generated PNG
// thumbnail.width / thumbnail.height - pixel dimensions
```

## Types

```typescript
type PreviewFileOptions = {
  filePath: string;
  chooserTitle?: string;    // Android only
  editingMode?: EditingMode; // iOS only
};

type PreviewFilesOptions = {
  filePaths: string[];
  initialIndex?: number;
  editingMode?: EditingMode;
};

type EditingMode = 'disabled' | 'createCopy' | 'updateContents';

type ThumbnailOptions = {
  filePath: string;
  size: { width: number; height: number };
  scale?: number;
};

type ThumbnailResult = {
  uri: string;
  width: number;
  height: number;
};
```

## Events

Subscribe using `addListener` or the `useEvent` hook from Expo.

| Event | Platform | Payload |
|-------|----------|---------|
| `onDismiss` | iOS | `{}` |
| `onEditedFile` | iOS | `{ filePath: string }` |
| `onSavedEditedCopy` | iOS | `{ originalPath: string, editedPath: string }` |

```typescript
const subscription = ExpoQuickLook.addListener('onDismiss', () => {
  console.log('Preview dismissed');
});

// Clean up
subscription.remove();
```

## Platform Differences

| Behavior | iOS | Android |
|----------|-----|---------|
| Preview style | In-app modal (QuickLook) | External app (Intent chooser) |
| Promise resolution | On dismiss | Immediately after launch |
| Multi-file preview | Supported | Not supported |
| Editing/markup | Supported | Not supported |
| Thumbnails | Supported | Not supported |
| Events | All events | None |

## Support

If you find this library useful, consider supporting its development:

<a href="https://buymeacoffee.com/magrinj" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50">
</a>

## License

[MIT](LICENSE)
