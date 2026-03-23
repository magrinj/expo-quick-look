---
sidebar_position: 2
---

# Authenticated Downloads

Pass custom headers to download protected files using the `requestOptions` parameter.

```typescript
await ExpoQuickLook.previewFile({
  uri: 'https://api.example.com/documents/123/download',
  requestOptions: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});
```

## Custom Headers

The `requestOptions.headers` field accepts any `Record<string, string>`. Common use cases:

```typescript
// Bearer token
requestOptions: {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
}

// API key
requestOptions: {
  headers: {
    'X-API-Key': apiKey,
  },
}

// Multiple headers
requestOptions: {
  headers: {
    Authorization: `Bearer ${token}`,
    'X-Request-ID': requestId,
  },
}
```

## Handling Auth Errors

When authentication fails (401/403), the promise rejects with an HTTP error:

```typescript
try {
  await ExpoQuickLook.previewFile({
    uri: 'https://api.example.com/documents/123',
    requestOptions: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired — refresh and retry
    const newToken = await refreshToken();
    await ExpoQuickLook.previewFile({
      uri: 'https://api.example.com/documents/123',
      requestOptions: {
        headers: { Authorization: `Bearer ${newToken}` },
      },
    });
  }
}
```

## Multi-File Preview with Auth

Authentication headers also work with `previewFiles` on iOS:

```typescript
await ExpoQuickLook.previewFiles({
  uris: [
    'https://api.example.com/documents/1',
    'https://api.example.com/documents/2',
  ],
  requestOptions: {
    headers: { Authorization: `Bearer ${token}` },
  },
});
```

The same headers are used for all files in the list.
