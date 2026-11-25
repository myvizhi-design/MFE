# Architecture & team standards

## 1. Why this shape

This follows the industry-standard **host + remotes** micro-frontend model (Module Federation),
which is what most enterprise portals use today:

| Concern | Owner | Rule |
|---|---|---|
| Layout (header, side menu, footer), top-level routes, login, session | **Shell** | Remotes never render their own layout or login inside the shell |
| A business area (Users, Orders, Reports…) | **One remote per team** | Owns everything under its `basePath`: pages, API calls, state |
| Session, HTTP client, role checks | `@mfe/auth` | **Shared singleton**: exactly one instance at runtime |
| Visual consistency | `@mfe/ui` + `@mfe/config/theme.css` | Bundled into each app; same tokens everywhere |
| Cross-app types | `@mfe/contracts` | The *only* coupling between shell and remotes |

Remotes are discovered at **runtime** from `apps/shell/public/mfe.registry.json`, not at build time.
To move a remote to a new URL or add one, deploy a new registry JSON. The shell is not rebuilt.

## 2. Authentication flow (DummyJSON, verified against the live API)

```
LOGIN         POST /auth/login {username, password, expiresInMins}
              → 200 {accessToken, refreshToken, id, username, …}   (NO role in this response)
              → 400 {"message":"Invalid credentials"}
PROFILE       GET  /auth/me   Authorization: Bearer <access>
              → 200 full profile incl. role: admin | moderator | user
              → 401 "Access Token is required" | "Invalid/Expired Token!"
REFRESH       POST /auth/refresh {refreshToken, expiresInMins}
              → 200 new {accessToken, refreshToken}   (refresh token ROTATES)
PROTECTED     any resource under /auth/*  e.g. GET /auth/users  (needs Bearer)
```

How the portal uses it (`packages/auth`):

1. **Login**: `/auth/login` → store the tokens → `/auth/me` → `User` (only whitelisted fields; the raw
   profile contains password, SSN and bank data, which are never kept).
2. **Storage**: the access token stays **in memory only**. The refresh token goes in `sessionStorage`, so a reload restores the session.
   *Production:* move the refresh token into an httpOnly Secure cookie issued by your backend/BFF.
3. **Boot / reload**: if a refresh token exists → `/auth/refresh` → `/auth/me` → authenticated. If that fails → login page.
4. **Every API call** goes through `apiClient` (Axios): it adds `Authorization: Bearer`. On **401** it runs **one**
   shared refresh (concurrent 401s wait for the same promise, which matters because tokens rotate), then retries
   the request once. If the refresh fails → session cleared → `session-expired` event → redirect to login.
5. **Authorisation** happens at 3 levels: the shell hides menu items (`manifest.nav[].roles`), the shell blocks the whole
   module route (`manifest.roles` → 403 page), and the module hides or blocks actions (`<RequireRole>`, `hasRole()`).
   The backend must still enforce all of these; UI checks only improve the experience.

## 3. Runtime boot sequence

```
shell main.tsx ──import()──▶ bootstrap.tsx        (async boundary: MF negotiates shared singletons first)
  AuthProvider    restore session via refresh token
  ModulesProvider fetch mfe.registry.json → registerRemotes() → loadRemote('<name>/manifest') for each
  Router          /login | <RequireAuth><AppLayout>
                     /<basePath>/*  → RemoteModule → loadRemote('<name>/App') inside Suspense + ErrorBoundary
```

If a remote is down, its manifest fails to load and the shell marks it "Module unavailable" in the menu.
The footer shows `1/2 modules online` and the rest of the portal keeps working. This has been tested.

## 4. Rules every module must follow

1. **Federation name = registry `name` = `manifest.name`.**
2. Expose exactly `./App` (default export, `RemoteAppProps`) and `./manifest` (default `ModuleManifest`).
3. **Relative routes only** inside the remote (`<Route index>`, `path="new"`, `<Link to="..">`). The shell decides the
   prefix (`/users`). Standalone mode mounts the same component at `/`.
4. **Use `apiClient` from `@mfe/auth`** for every authenticated call. Never read tokens yourself and never create
   another Axios instance with auth.
5. **Never render `AuthProvider` or `BrowserRouter` in `App.tsx`.** Those exist only in `bootstrap.tsx` (standalone mode).
6. Use **your own `QueryClient`** inside `App.tsx` (isolated cache per module).
7. **CSS isolation:** the remote CSS has no preflight, and utilities are wrapped in `@scope ([data-mfe="<name>"])`.
   `App.tsx`'s outermost element is `<div data-mfe="<name>">`. *Why:* without this, a remote's `.hidden` loaded
   after the shell CSS overrode the shell header's `sm:block`, which hid the user name. We found this in testing.
   Content rendered outside that div (portals and modals on `body`) is not covered by the scope. Render it inside the div.
8. Validation: one **Zod schema per form** in `src/schemas`. Types come from `z.infer`, and the form uses `zodResolver`.
9. Only add a dependency to `packages/config/federation.js` → `sharedDeps` if it **must** be a single instance.
10. Keep `manifest.ts` tiny (no imports other than types). The shell loads every manifest at startup.

## 5. Add a new module (≈10 minutes)

```bash
# 1. copy the template
cp -r apps/dashboard apps/orders     # (Windows: xcopy /E /I apps\dashboard apps\orders)
```
2. `apps/orders/package.json` → `"name": "@mfe/orders"`.
3. `packages/config/federation.js` → add `orders: 3003` to `ports`.
4. `apps/orders/vite.config.ts` → `name: 'orders'`, `ports.orders`. In `.env` → `VITE_PUBLIC_URL=http://localhost:3003/`.
5. `src/manifest.ts` → `name: 'orders'`, title, order, roles, nav.
6. `src/App.tsx` → `<div data-mfe="orders">`. `src/styles.css` → `@scope ([data-mfe="orders"])`.
7. Register it in `apps/shell/public/mfe.registry.json`:
   `{ "name": "orders", "entry": "http://localhost:3003/remoteEntry.js", "basePath": "/orders" }`
8. Add it to the root `dev`/`preview` scripts, then run `npm install`.

The side menu, route, role guard, loading state and error boundary all come from the shell automatically.
If the module needs an icon the menu doesn't know yet, add it to `IconName` (`contracts`) and to `Icon.tsx` (`ui`).

## 6. Deployment model

- Each app builds to its own `dist/` and deploys **independently** (CDN or static host).
- Remotes: set `VITE_PUBLIC_URL` to the final absolute URL at build time (chunks are loaded cross-origin).
- Shell: serve a per-environment `mfe.registry.json` (or point `VITE_MFE_REGISTRY_URL` at a config service).
- The remote host must send CORS headers for `remoteEntry.js` and its chunks.
- Breaking changes to `@mfe/contracts` or a shared singleton's major version need a coordinated release. Bump
  `requiredVersion` in `federation.js` deliberately.
- SPA fallback: the shell host must rewrite unknown paths to `index.html`.

## 7. Next steps for production

- Replace DummyJSON with your API: change `VITE_API_BASE_URL` and adjust `packages/auth/src/authApi.ts`
  (map your `/me` response to `User`), then remove the `DEMO_ACCOUNTS` block in `LoginForm.tsx`.
- Refresh token → httpOnly cookie via a BFF. Then `tokenStore` only keeps the access token in memory.
- Add ESLint + Prettier, Vitest + Testing Library for units, Playwright e2e in CI, and Sentry in `ErrorBoundary.componentDidCatch`.
- Cross-tab logout (BroadcastChannel) if you move tokens to `localStorage`/cookies.
