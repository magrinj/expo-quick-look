---
sidebar_position: 3
---

# Multi-File Preview

:::info iOS Only
`previewFiles` is only available on iOS. On Android, use `previewFile` to open files one at a time.
:::

Open multiple files in a swipeable gallery using `previewFiles`:

```typescript
await ExpoQuickLook.previewFiles({
  uris: ['/path/to/file1.pdf', '/path/to/file2.png', '/path/to/file3.txt'],
  initialIndex: 0,
  editingMode: 'disabled',
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `uris` | `string[]` | required | Array of file paths or URLs |
| `initialIndex` | `number` | `0` | Which file to show first |
| `editingMode` | `EditingMode` | `'disabled'` | Editing mode for all files |
| `requestOptions` | `RequestOptions` | — | Headers for remote downloads |

## Navigation

Users can swipe left/right to navigate between files. The QuickLook controller shows a page indicator and supports the share button for each file.

## Mixing Local and Remote Files

You can mix local paths and remote URLs in the same list:

```typescript
await ExpoQuickLook.previewFiles({
  uris: [
    '/local/path/file.pdf',
    'https://example.com/remote.pdf',
  ],
});
```

Remote files are downloaded before the preview opens.
