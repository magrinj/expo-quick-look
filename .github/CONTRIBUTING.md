# Contributing to expo-quick-look

Thanks for your interest in contributing!

## Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development)
- [Android Studio](https://developer.android.com/studio) (for Android development)

## Setup

```bash
# Install dependencies
bun install

# Build the example app
cd example && npx expo prebuild
```

## Development Workflow

1. Make your changes in `src/`, `ios/`, or `android/`
2. Test in the example app: `cd example && bun run ios` (or `bun run android`)
3. Run checks: `bun run typecheck && bun run lint`

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a clear description of what and why
- Ensure lint and typecheck pass before submitting
- Add tests if applicable

## Code Style

This project uses ESLint with the Expo config. Run `bun run lint` to check for issues.
