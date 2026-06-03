# Changelog

# [0.4.0](https://github.com/magrinj/expo-quick-look/compare/v0.3.1...v0.4.0) (2026-06-03)


### Bug Fixes

* only tarball needed files ([da58280](https://github.com/magrinj/expo-quick-look/commit/da582803ae6e89a38ed82e1749d491031a6c5248))
* release-it publish args ([d2f63e5](https://github.com/magrinj/expo-quick-look/commit/d2f63e5f6ed31bca5973d2ea48e65f7ca2307310))
* track website docs in git and unblock Docusaurus CI build ([2e8c1aa](https://github.com/magrinj/expo-quick-look/commit/2e8c1aa2b5e33067a36edb96629ee246673e9475))
* use GitHub-hosted video URLs for README demo previews ([76474b2](https://github.com/magrinj/expo-quick-look/commit/76474b26ed7eb4acf0c756517bb1bf233d6c787a))


### Features

* add onWillDismiss event for iOS preview dismissal start ([ed345db](https://github.com/magrinj/expo-quick-look/commit/ed345db8a829b400954520ee2d9ed28a8291b1da))
* **example:** redesign app with Expo Router, native tabs, and demo videos ([c8af563](https://github.com/magrinj/expo-quick-look/commit/c8af56313be5ca1bb8b720526bc26a4ccd46dc89))
* migrate docs to Docusaurus, add global ESLint with Prettier ([ee077dc](https://github.com/magrinj/expo-quick-look/commit/ee077dc89d610e30b54fd9f003b33a119073de9b))

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- Add `onWillDismiss` event for iOS preview dismissal start ([#3](https://github.com/magrinj/expo-quick-look/issues/3))

### 🐛 Bug fixes

### 💡 Others

## 0.3.1 — 2026-03-19

### 🐛 Bug fixes

- Improve remote file download and QuickLook reliability ([#4e7879b](https://github.com/magrinj/expo-quick-look/commit/4e7879b))

## 0.3.0 — 2026-03-18

### 🛠 Breaking changes

- Rename `filePath` to `uri` ([#c2bb20e](https://github.com/magrinj/expo-quick-look/commit/c2bb20e))

### 🎉 New features

- Add `requestOptions.headers` support for authenticated downloads ([#c2bb20e](https://github.com/magrinj/expo-quick-look/commit/c2bb20e))

## 0.2.1 — 2026-03-18

### 🐛 Bug fixes

- Export mocks ([#87cc4b5](https://github.com/magrinj/expo-quick-look/commit/87cc4b5))

## 0.2.0 — 2026-03-17

### 🎉 New features

- Support remote files ([#866ddd9](https://github.com/magrinj/expo-quick-look/commit/866ddd9))

## 0.1.1 — 2026-03-16

### 🎉 New features

- Initial release
- Native file preview using QuickLook (iOS) and Intent viewer (Android)
- `previewFile`, `previewFiles`, `canPreview`, `generateThumbnail` APIs
- Expo module with config plugin
