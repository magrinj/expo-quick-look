---
sidebar_position: 5
---

# Thumbnails

:::info iOS Only
`generateThumbnail` uses `QLThumbnailGenerator`, which is only available on iOS.
:::

Generate thumbnails for local files:

```typescript
const thumbnail = await ExpoQuickLook.generateThumbnail({
  uri: '/path/to/file.pdf',
  size: { width: 200, height: 200 },
});

// thumbnail.uri    — file:// URI to the generated PNG
// thumbnail.width  — actual pixel width
// thumbnail.height — actual pixel height
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `uri` | `string` | required | Local file path (remote URLs not supported) |
| `size` | `{ width, height }` | required | Requested thumbnail size in points |
| `scale` | `number` | device scale | Pixel scale multiplier |

## Scale Parameter

The `scale` parameter controls the pixel density of the output:

```typescript
// Default: uses device scale (2x on most iPhones, 3x on Pro models)
const thumb = await ExpoQuickLook.generateThumbnail({
  uri: path,
  size: { width: 200, height: 200 },
});
// On a 3x device: output is 600x600 pixels

// Explicit scale
const thumb3x = await ExpoQuickLook.generateThumbnail({
  uri: path,
  size: { width: 200, height: 200 },
  scale: 3,
});
// Always 600x600 pixels regardless of device
```

## Output Size

The actual output dimensions may differ from the requested `size` — the system preserves the file's aspect ratio. A 200x200 request for a landscape PDF may return a 200x150 thumbnail.

## Local Files Only

`generateThumbnail` only works with local files. Passing a remote URL will throw an error:

```typescript
// This will throw
await ExpoQuickLook.generateThumbnail({
  uri: 'https://example.com/file.pdf',
  size: { width: 200, height: 200 },
});

// Download first, then generate
// Use expo-file-system or fetch to download, then pass the local path
```

## Supported File Types

Any file type that QuickLook supports can generate a thumbnail: PDFs, images, Office documents, text files, and more.
