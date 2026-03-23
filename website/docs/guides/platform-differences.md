---
sidebar_position: 6
---

# Platform Differences

This library wraps platform-native file viewers, so behavior differs between iOS and Android.

## Comparison

| Behavior | iOS | Android |
|----------|-----|---------|
| **Preview style** | In-app modal (QuickLook) | External app (Intent chooser) |
| **Promise resolution** | Resolves when user dismisses | Resolves immediately after launch |
| **Multi-file preview** | Swipeable gallery | Not supported |
| **Editing/markup** | Built-in markup tools | Not supported |
| **Thumbnails** | `QLThumbnailGenerator` | Not supported |
| **Events** | `onDismiss`, `onEditedFile`, `onSavedEditedCopy` | None |
| **Remote files** | Download to temp + preview | Download to cache + launch |
| **Chooser title** | Not applicable | Customizable via `chooserTitle` |

## iOS Details

On iOS, `QLPreviewController` is presented as a modal view controller. The user stays in your app and can dismiss the preview to return. This means:

- You know when the preview is dismissed (`onDismiss` event)
- You can react to edits (`onEditedFile`, `onSavedEditedCopy`)
- The promise resolves after dismissal, so you can chain actions:

```typescript
await ExpoQuickLook.previewFile({ uri: path });
// User has dismissed the preview
console.log('Preview closed');
```

## Android Details

On Android, an Intent is fired and the system picks an app to handle it. This means:

- Your app goes to the background
- You don't know when the user is done viewing
- The promise resolves right after launch
- No events are available

```typescript
await ExpoQuickLook.previewFile({ uri: path });
// Intent was launched — user may still be viewing
console.log('Intent launched');
```

### Custom Chooser Title

On Android, customize the "Open with" dialog title:

```typescript
await ExpoQuickLook.previewFile({
  uri: path,
  chooserTitle: 'View document with',
});
```

## Writing Cross-Platform Code

Use `Platform.OS` to handle differences:

```typescript
import { Platform } from 'react-native';

await ExpoQuickLook.previewFile({ uri: path });

if (Platform.OS === 'ios') {
  // Preview was dismissed — safe to clean up
} else {
  // Intent launched — file may still be in use
}
```

Use `canPreview` to check if a file type is supported before attempting to open it:

```typescript
const supported = await ExpoQuickLook.canPreview(path);
if (!supported) {
  // Show fallback UI
}
```
