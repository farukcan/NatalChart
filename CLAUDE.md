# NatalChart

Natal chart calculator and visualizer. Built with Expo (React Native + Web).

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19
- **Routing:** expo-router (file-based, typed routes)
- **Styling:** React Native StyleSheet
- **Storage:** @react-native-async-storage/async-storage
- **Charts:** react-native-svg
- **Astronomy:** astronomy-engine
- **Icons:** lucide-react-native
- **Lint/Format:** ESLint + Prettier

## Commands

```bash
npm run dev               # Start dev server (all platforms)
npm run build:web         # Export web build
npm run lint              # Lint
npm run typecheck         # Type check
npm run format:check      # Check formatting
npm run generate:branding # Regenerate icon/splash PNGs and logo SVG
```

## Project Structure

```
app/             # Expo Router pages
  (tabs)/        # Tab navigator screens
components/      # Reusable UI components
hooks/           # Custom React hooks
lib/             # Business logic, utils, types
contexts/        # React contexts
assets/          # Images, fonts
scripts/         # Node tooling (branding generation, etc.)
```

## Branding Assets

App icon, favicon, splash, adaptive icon (PNG), and logo (SVG) are generated procedurally by `scripts/generate-branding.mjs` and written to `assets/images/`. Paths are wired in `app.json`. Re-run `npm run generate:branding` after changing the mark design.

## Cross-Platform Rules (CRITICAL)

This app runs on iOS, Android, AND Web. Every code change MUST work on all three platforms.

### Platform-Specific APIs

Never use web-only APIs (`window.confirm`, `window.alert`, `window.prompt`, `document.*`, `localStorage`) or native-only APIs directly. Always branch with `Platform.OS`:

```tsx
import { Platform, Alert } from 'react-native';

// Correct
if (Platform.OS === 'web') {
  window.confirm('Sure?');
} else {
  Alert.alert('Title', 'Sure?', [...]);
}
```

### Common Pitfalls

- `Alert.alert()` does NOT work on web. Use `window.confirm`/`window.alert` for web.
- `Linking.openURL()` works cross-platform, but behavior differs. Test both.
- `DateTimePicker` from `@react-native-community/datetimepicker` is native-only. Use a custom picker or conditional rendering for web.
- `expo-haptics` is no-op on web but won't crash. Still guard if behavior depends on it.
- `AsyncStorage` works on all platforms (uses localStorage on web internally).
- `react-native-svg` works on all platforms via `react-native-svg-web` bundled by Expo.

### Styling

- Use `StyleSheet.create()` for all styles. No inline style objects in render.
- Use `Platform.select()` for platform-specific style values.
- Avoid pixel-perfect fixed dimensions. Use flex layout and percentages.
- Always handle safe areas with `react-native-safe-area-context`.
- Test that scrollable content works with both touch and mouse/wheel.

## React Native Best Practices

### Performance

- Use `useCallback` and `useMemo` for functions/values passed as props.
- Use `FlatList` (or `FlashList`) instead of `ScrollView` + `.map()` for long lists.
- Never create new objects/arrays/functions inside render without memoization if passed to children.
- Avoid unnecessary re-renders: split state into smaller, independent pieces.

### Navigation

- Use typed routes from expo-router. Never hardcode route strings without type checking.
- Use `useFocusEffect` instead of `useEffect` for screen-focused data fetching.

### State Management

- Keep state as local as possible. Lift only when truly shared.
- For app-wide state, use React Context. No external state library unless justified.

### Images and Assets

- Use `expo-image` or `Image` from react-native with proper `resizeMode`.
- Always provide width/height for images to avoid layout shifts.

### Error Handling

- Show user-friendly error messages via platform-appropriate alerts.
- Never let errors silently fail in async operations. Always catch and surface.

### TypeScript

- All files must be `.ts` or `.tsx`. No `.js` files.
- Strict typing on all function parameters and return types.
- Define interfaces/types in the relevant `lib/` file, co-located with business logic.
