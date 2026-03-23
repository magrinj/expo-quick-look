---
sidebar_position: 1
---

# Getting Started

## Prerequisites

- [Expo](https://expo.dev) SDK 52 or later
- Managed or bare workflow
- iOS 13+ / Android 5.0+

## Installation

```bash
npx expo install @magrinj/expo-quick-look
```

No additional native configuration is required. The Expo config plugin handles everything automatically.

## Quick Example

Preview a local file:

```typescript
import ExpoQuickLook from '@magrinj/expo-quick-look';

// Preview a file
await ExpoQuickLook.previewFile({
  uri: '/path/to/file.pdf',
});
```

Preview a remote file (the library downloads it automatically):

```typescript
await ExpoQuickLook.previewFile({
  uri: 'https://example.com/document.pdf',
});
```

Check if a file can be previewed:

```typescript
const supported = await ExpoQuickLook.canPreview('/path/to/file.pdf');
```

## How It Works

- **iOS:** Presents a `QLPreviewController` modally. The promise resolves when the user dismisses the preview. Supports 100+ file formats natively, including PDF, images, Office documents, and more.
- **Android:** Launches an Intent chooser with `ACTION_VIEW`. The promise resolves immediately after launch. The system picks the best available app for the file type.

## Next Steps

- [Remote Files](/docs/guides/remote-files) — download and preview files from URLs
- [Authenticated Downloads](/docs/guides/authenticated-downloads) — pass custom headers
- [Platform Differences](/docs/guides/platform-differences) — understand iOS vs Android behavior
- [API Reference](/docs/api) — full TypeScript API documentation

## Example App

See the [example app](https://github.com/magrinj/expo-quick-look/tree/main/example) for a complete demo with all features.
