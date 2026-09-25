---
sidebar_position: 6
---

# Platform Differences

This library wraps platform-native file viewers, so behavior differs between iOS, Android, and web.

## Comparison

| Behavior | iOS | Android | Web |
|----------|-----|---------|-----|
| **Preview style** | In-app modal (QuickLook) | External app (Intent chooser) | New browser tab (`window.open`) |
| **Promise resolution** | Resolves when user dismisses | Resolves immediately after launch | Resolves immediately, even if the tab was blocked |
| **Multi-file preview** | Swipeable gallery | Not supported | One tab per file |
| **Editing/markup** | Built-in markup tools | Not supported | Not supported |
| **Thumbnails** | `QLThumbnailGenerator` | Not supported | Not supported (throws) |
| **Events** | `onWillDismiss`, `onDismiss`, `onEditedFile`, `onSavedEditedCopy` | None | None |
| **Remote files** | Download to temp + preview | Download to cache + launch | Browser fetches the URL directly |
| **Request headers** | Supported | Supported | Ignored |
| **Chooser title** | Not applicable | Customizable via `chooserTitle` | Not applicable |
| **`canPreview`** | `QLPreviewController.canPreview` | Checks installed handlers | Always `true` |

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

## Web Details

On web there is no native preview controller, so the file is handed off to the browser by opening it in a new tab. This means:

- Your app keeps running; the file opens in a separate tab
- You don't know when the user is done viewing — no events fire
- The promise resolves immediately, without knowing whether the browser actually opened the tab (a blocked pop-up can't be detected)
- `requestOptions.headers` are ignored (the browser fetches the URL itself)
- Only `http(s):` and `blob:` URIs work. Browsers refuse to open `data:` URLs in a new tab, and `file://` paths aren't reachable from a web page
- `canPreview` always returns `true`, and `generateThumbnail` throws an `ERR_UNAVAILABLE` error

```typescript
await ExpoQuickLook.previewFile({ uri: 'https://example.com/doc.pdf' });
// A new browser tab was opened
```

:::note
Browsers block pop-ups that aren't triggered by a direct user gesture. Call `previewFile` / `previewFiles` from an event handler (e.g. an `onPress`), not from an effect or timeout, or the tab may be blocked. `previewFiles` opens one tab per URI, so multiple tabs are especially likely to be blocked.
:::

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
