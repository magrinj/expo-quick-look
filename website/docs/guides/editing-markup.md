---
sidebar_position: 4
---

# Editing & Markup

:::info iOS Only
Editing and markup features are only available on iOS via `QLPreviewController`.
:::

Control whether users can edit files during preview using the `editingMode` option.

## Editing Modes

| Mode | Behavior | Event Fired |
|------|----------|-------------|
| `'disabled'` | Read-only preview (default) | `onDismiss` only |
| `'createCopy'` | Edits are saved to a new file | `onSavedEditedCopy` |
| `'updateContents'` | Edits modify the original file | `onEditedFile` |

## Create Copy

Edits are saved to a new file, leaving the original untouched:

```typescript
await ExpoQuickLook.previewFile({
  uri: '/path/to/image.png',
  editingMode: 'createCopy',
});
```

Listen for the saved copy:

```typescript
const subscription = ExpoQuickLook.addListener(
  'onSavedEditedCopy',
  (event) => {
    console.log('Original:', event.originalPath);
    console.log('Edited copy:', event.editedPath);

    // Preview the edited copy
    ExpoQuickLook.previewFile({ uri: event.editedPath });
  }
);
```

## Update Contents

Edits modify the original file in place:

```typescript
await ExpoQuickLook.previewFile({
  uri: '/path/to/image.png',
  editingMode: 'updateContents',
});
```

Listen for edits:

```typescript
const subscription = ExpoQuickLook.addListener(
  'onEditedFile',
  (event) => {
    console.log('File modified:', event.filePath);
  }
);
```

## Event Flow

1. User opens preview — no event
2. User taps the markup button and makes edits
3. User taps "Done"
   - `createCopy` → `onSavedEditedCopy` fires with both paths
   - `updateContents` → `onEditedFile` fires with the file path
4. User dismisses preview → `onDismiss` fires

Always clean up listeners:

```typescript
// In a React component
useEffect(() => {
  const sub = ExpoQuickLook.addListener('onSavedEditedCopy', handler);
  return () => sub.remove();
}, []);
```
