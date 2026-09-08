# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a two-package monorepo (no workspace tooling — each package is installed and run independently):

- `reader-app/` — Expo / React Native manga reader (the client). Uses **bun** (`bun.lock`).
- `api/` — Apollo GraphQL server that proxies the **MangaDex** REST API. Uses **npm** (`package-lock.json`). The GraphQL layer is a thin wrapper over MangaDex; consult the upstream API docs when adding/changing endpoints, query params, or types: https://api.mangadex.org/docs/

The whole reader-app (home, Explore, manga detail, chapter reader) consumes the `api` GraphQL server (see "reader-app data layer" below). There is no local seed/mock data.

## Commands

### reader-app (run from `reader-app/`)
- `bun install` — install deps
- `bun start` / `bun android` / `bun ios` / `bun web` — start Expo dev server (uses `expo-dev-client`, so a custom dev build is expected rather than Expo Go)
- `bun run lint` — ESLint (`eslint-config-expo` + Prettier)
- No test runner is configured.
- Builds are via EAS (`eas.json` defines `development`, `preview`, `production` profiles); `appVersionSource` is `remote`.

### api (run from `api/`)
- `npm install`
- `npm run dev` — hot-reloading dev server via `tsx watch` (serves on `http://localhost:4000`)
- `npm run compile` — type-check + emit to `dist/` (used as a type-check gate; the emitted `dist/` is not what runs)
- `npm start` — run via `tsx src/index.ts` (same as the Render `startCommand`). Native `node dist/index.js` does **not** work: `tsc` leaves the `~/*` path alias, directory imports (`./schemas`) and extensionless imports verbatim, which Node's ESM loader rejects — `tsx` resolves all three.
- No tests (the `test` script intentionally exits 1).

## api architecture

Apollo standalone server (`src/index.ts`) on port 4000. GraphQL is assembled in `src/schemas/index.ts` from per-domain folders (`mangas/`, `manga-chapters/`), each exporting `typeDefs` + `resolvers` that are merged with `makeExecutableSchema`.

Data access uses a **repository + factory pattern**:
- `src/repository/factory.ts` — `FetchFactory<T>` wraps `ofetch` and returns a Go-style tuple `[error]` / `[null, data]` from `.call()`. Never throws; resolvers destructure `[error, resp]` and return `[]`/empty on error.
- `src/repository/modules/*.module.ts` — one class per domain extending `FetchFactory`. Modules encapsulate MangaDex query params (e.g. `manga.module.ts` hardcodes `availableTranslatedLanguage=pt-br`, content rating, and cover/author includes).
- `src/repository/api.ts` — exports `createModules(token)`, a **per-request** factory: it builds an `ofetch` instance whose `onRequest` hook injects `Authorization: Bearer <token>` (the caller's forwarded token) and returns `{ manga }`.

**Per-user identity (no server account).** The server has no MangaDex account of its own. Each GraphQL request must carry the logged-in user's MangaDex access token (the reader-app forwards it — see below); `src/index.ts`'s Apollo `context` reads that bearer and calls `createModules(token)`, so every upstream call runs under that user's identity. A `didResolveOperation` plugin **rejects any operation without a token** (`UNAUTHENTICATED` / HTTP 401), except operations whose `operationName` is `IntrospectionQuery` (left open so the reader-app's codegen can read the schema over HTTP). Note: graphql-codegen's URL loader doesn't send that `operationName`, so codegen must pass a (throwaway) bearer via `CODEGEN_AUTH_TOKEN` — see `reader-app/codegen.ts`; introspection never reaches the resolvers, so the value is irrelevant. Resolvers pull the request-scoped modules from `context.modules`. There is no owner-credential login/refresh/cache anymore (the old `src/cache/`, `auth.module.ts`, and owner env vars were removed).

Config comes from env vars via `dotenv` in `src/config.ts` (`.env` is gitignored). Required keys: `BASE_URL`, `UPLOAD_BASE_URL`.

Path alias: `~/*` → repo root (e.g. `~/src/types/...`). ESM (`"type": "module"`).

## reader-app architecture

Expo Router (file-based routing under `src/app/`); `expo-router/entry` is the app entry. `src/app/_layout.tsx` is the root Stack (headers hidden, dark `#262626` background, wrapped in `GestureHandlerRootView`). Routes:
- `(tabs)/` — the tab bar: `index.tsx` (Início/home), `explore.tsx` (Explorar), `bookshelf.tsx` (Estante), `profile.tsx` (Perfil/logout)
- `manga/[id].tsx` — manga detail
- `manga/chapter/[id].tsx` — the chapter reader

Styling is **NativeWind v4** (Tailwind classes via `className`). `global.css` is the Tailwind entry (wired through `metro.config.js` `withNativeWind` and the `babel.config.js` `jsxImportSource: nativewind` preset). `src/utils/cn.ts` merges classes with `clsx` + `tailwind-merge`. The app is dark-mode only (`userInterfaceStyle: "dark"`).

The chapter reader is state-driven through React Context providers under `src/store/`, composed in the reader route:
- `ChapterControlContext` — tracks `currentPage`/`totalPages` and drives the page `FlatList` via `chapterListRef.scrollToIndex` (`handleSlide`). Page count comes from the chapter's images (`useChapterImgs`).
- `SystemBarsContext` — status/navigation bar visibility while reading.

Components are grouped by feature (`components/reader/`, `components/manga-detail/`, `components/manga/`, `components/explore/`, `components/home/`, `components/bookshelf/`) plus shared primitives in `components/ui/` (`Button`, `Input`, `BackButton`, `ErrorState`, `Skeleton`) and top-level shared components (`AppText`, `Chip`, `VerticalManga`, zoom via `@likashefqet/react-native-image-zoom`). Loading states use skeleton placeholders (`components/skeletons/MangaSkeletons.tsx`, built on the `Skeleton` primitive) instead of spinners; error states use `ErrorState` with a retry wired to the query's `refetch` (list hooks expose `refetch`). Animations use `react-native-reanimated` v4 (with `react-native-worklets`, `.get()/.set()` idiom); images use `expo-image` (see the shared `blurhash` in `src/constants/general.ts`).

Path alias: `@/*` → `src/*` (`tsconfig.json`).

### reader-app data layer (GraphQL)

The home screen fetches from the `api` GraphQL server through a small hand-rolled layer (no Apollo Client / heavy dep):
- `src/services/graphql.ts` — `gqlRequest(query, variables)` POSTs to `API_URL` (the Apollo standalone server's root path) and attaches `Authorization: Bearer <token>` on every call. The token comes from a module-level getter registered by `AuthContext` via `setAuthTokenGetter` (the API now requires it — see below); with no token it throws before fetching. Base URL comes from `EXPO_PUBLIC_API_URL`, defaulting to `http://localhost:4000`. **Host caveat:** localhost only works on iOS simulator / web; Android emulator needs `http://10.0.2.2:4000`, a physical device needs the machine's LAN IP. Set it via `EXPO_PUBLIC_API_URL` (e.g. in `.env`).
- `src/services/manga.ts` — the list queries (`latestUpdates` / `recentlyAdded` / `highestRanking`), each **aliased to `mangas`** so the hook always reads `data.mangas`. Also maps `GqlManga` → the UI's `MangaCover`: builds the cover URL as `https://uploads.mangadex.org/covers/{id}/{fileName}.256.jpg` (fileName comes from the cover_art relationship), and resolves a display title with a fallback chain (`title.en/pt_br/ja` → `altTitles` en/pt_br → any value → `"Sem título"`), since MangaDex frequently stores the canonical title only in a romanized original language.
- `src/hooks/useMangas.ts` — `useMangas(query, limit)` returns `{ data, loading, error }` with an `active` guard against setState-after-unmount.
- `src/components/home/*` — `MangaSection` is the reusable presentational section (title + horizontal carousel, with loading/error states); `LatestUpdates` / `RecentlyAdded` / `HighestRanking` each bind one query to it.

The three sections map to distinct MangaDex sort orders defined server-side in `api/src/schemas/mangas/resolvers.ts` (`latestUploadedChapter` / `createdAt` / `followedCount`, all `desc`).

### reader-app authentication (device-minted token, gate)

Each user authenticates with their own MangaDex *personal API client*. Token **minting** stays fully client-side — the OAuth grants go **directly** to `auth.mangadex.org`, so the **client secret never leaves the device / reaches the app owner**. The short-lived **access token** *is* forwarded to `api/` on each GraphQL call (the API relays it upstream so requests run under the user's identity). Doctrine: the *secret* stays on-device; only the *access token* transits `api/`. (Any future MangaDex call that needs the secret must still go direct to MangaDex.)
- `src/services/auth.ts` — OAuth password/refresh grants POSTed **directly** to `auth.mangadex.org` (`EXPO_PUBLIC_MANGADEX_AUTH_URL`, default `https://auth.mangadex.org`). Requires `username`, `password`, `client_id` **and** `client_secret`. Error messages are deliberately generic — never log or surface secrets/tokens.
- `src/services/secureStore.ts` — persists the session JSON (client id/secret + tokens, **never the password**) in the device secure enclave via `expo-secure-store`. Native-only: SecureStore is unavailable on web.
- `src/store/AuthContext.tsx` — `useAuth()` (`login` / `logout` / `getValidAccessToken` / `isAuthenticated` / `loading`). Restores the session on startup, auto-refreshes the 15-min access token (coalescing concurrent refreshes), and clears the session if the refresh token is dead. Registers `getValidAccessToken` with `graphql.ts` via `setAuthTokenGetter` so `gqlRequest` always sends a fresh token; `logout` also calls `queryClient.clear()` to drop the previous user's cached data. Provider is mounted in `src/app/_layout.tsx`.
- **Auth gate (mandatory login).** `src/app/_layout.tsx` renders a `RootNavigator` inside `AuthProvider` that holds the splash while `loading`, then uses `Stack.Protected` guards: `(tabs)` + `manga` behind `isAuthenticated`, the `(auth)` group behind `!isAuthenticated`. Login/logout flip the guard — no manual navigation. So the app opens on login unless a session is already restored.
- Screens live in the `src/app/(auth)/` group with its own `_layout.tsx` (initial route `login`): `login.tsx` (form) + `login-help.tsx` (how to obtain the client id/secret + privacy notice). Logout lives on the Perfil tab (`src/app/(tabs)/profile.tsx`); home is only reachable when authenticated.
- Reusable form primitives live in `src/components/ui/` (`Input`, `Button`).

### reader-app local data (per-account) & cloud sync

On-device data is three Zustand `persist` stores: `@continue-reading`, `@bookshelf` (status + page bookmarks), `@reading-mode-overrides`. They persist through **`src/store/userScopedStorage.ts`** — a `StateStorage` wrapper over AsyncStorage that **namespaces every key by the active MangaDex user id** (real key `${name}:${userId}`, or `:anon` when logged out). So each account keeps its own data on the same device and account Y never sees account X's. The stores set `skipHydration: true`; `AuthContext` calls `setActiveUser(userId)` + `rehydrateUserStores()` (`src/store/rehydrateStores.ts`, which resets in-memory state first) on **login, logout, and startup restore**. The user id is the JWT `sub` of the MangaDex access token (`src/utils/jwt.ts`), stored on `StoredSession` and exposed as `useAuth().userId`.

**Cloud sync/backup is automatic via the app's own `api/` backend** (`src/store/SyncContext.tsx`, mounted inside `AuthProvider`), using the **MangaDex account as identity** — no separate login/OAuth. Because `gqlRequest` (`src/services/graphql.ts`) already attaches the MangaDex access token to every call, sync reuses it; the server derives the blob owner by **verifying that token's signature** (`api/src/auth/verifyToken.ts`, `jose` against the MangaDex Keycloak JWKS) and reads/writes one row per user. `src/services/sync.ts` is a thin transport with two ops — `syncPull` (query) / `syncPush` (mutation) — carrying the blob as a JSON **string**; the server stores it in Postgres (`api/src/db.ts`, table `sync_blobs(user_id, blob jsonb, updated_at)`; `DATABASE_URL`, Supabase/Neon). On login it pulls and hydrates the stores; store changes are pushed debounced; conflicts are last-write-wins by `updatedAt` (a per-user watermark in `@sync-updated-at:{userId}`, enforced both client-side and in the upsert's `WHERE`). Sync status + "Sincronizar agora" live on the Perfil tab. (History: this replaced an opt-in Google Drive `appDataFolder` backend — dropped because the `drive.appdata` sensitive scope forces Google OAuth verification to scale beyond a manual test-user list; the `@react-native-google-signin` dep, `googleAuth.ts`/`googleDrive.ts`, and the `EXPO_PUBLIC_GOOGLE_*` vars were removed. **Privacy shift:** reading data now lives on the app owner's backend, not the user's own Drive — reflected in `src/app/(auth)/login-help.tsx`.)

The auth session stays in the secure enclave (`expo-secure-store`), is never synced, and is not restored on reinstall (the gate requires a fresh login). **Note on Android Auto Backup:** `app.json` sets `android.allowBackup: true`, but the `expo-secure-store` config plugin injects backup rules that allowlist only the `sharedpref` domain — AsyncStorage actually stores everything in a SQLite DB (`RKStorage`, the `database` domain), which those rules **exclude**, so Auto Backup does **not** capture the stores. That's why the app data did not survive reinstall before cloud sync; the `api/` backend sync layer is now the intended persistence/sync path. (A config plugin adding `<include domain="database" .../>` could re-enable Auto Backup as an Android-only safety net, but is not currently applied.)

## Conventions

- Some user-facing strings and error messages are in **Portuguese** (pt-BR) — the reader targets a Brazilian Portuguese audience; match the existing language of surrounding code.
- Both packages are strict TypeScript.
