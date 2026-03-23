---
sidebar_position: 1
---

# Remote Files

The library can download and preview files from remote URLs. Just pass a URL as the `uri` parameter.

```typescript
await ExpoQuickLook.previewFile({
  uri: 'https://example.com/document.pdf',
});
```

## How It Works

When a URL is detected (starting with `http://` or `https://`):

1. The file is downloaded to a temporary location
2. The filename is inferred from the URL path or `Content-Disposition` header
3. The file is previewed using the native viewer
4. Temporary files are cleaned up automatically

### Platform Behavior

| | iOS | Android |
|---|---|---|
| Download location | Temp directory | Cache directory |
| Cleanup | Automatic | Automatic |
| Progress indication | Native loading UI | Native loading UI |

## Error Handling

If the download fails, the promise rejects with an error:

```typescript
try {
  await ExpoQuickLook.previewFile({
    uri: 'https://example.com/document.pdf',
  });
} catch (error) {
  // Network error, 404, timeout, etc.
  console.error('Preview failed:', error.message);
}
```

Common errors:
- **Network error** — device is offline or URL is unreachable
- **HTTP error** — server returned 4xx/5xx status
- **Invalid file** — downloaded content isn't a previewable file

## URLs Without File Extensions

If the URL doesn't contain a file extension (e.g., an API endpoint), the library uses the `Content-Disposition` header to determine the filename. This works automatically:

```typescript
// No .pdf in the URL — filename comes from Content-Disposition header
await ExpoQuickLook.previewFile({
  uri: 'https://api.example.com/documents/123/download',
});
```

For authenticated API endpoints, see [Authenticated Downloads](/docs/guides/authenticated-downloads).
