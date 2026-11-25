# Admin Portal: Micro-Frontend (MFE) monorepo

React 19 · TypeScript · Vite 8 · **Module Federation 2.0** (`@module-federation/vite`) · Tailwind CSS v4 ·
React Router 8 · React Hook Form + Zod · TanStack Query · Axios. Authentication runs against the public
**DummyJSON** API (JWT access token + rotating refresh token, with roles).

```
apps/
  shell/       HOST    :3000  layout (header, side menu, footer), routing, login, auth session, remote registry
  users/       REMOTE  :3001  reference module: list/search/paginate, detail, create/edit (validated), delete, RBAC
  dashboard/   REMOTE  :3002  minimal module template
packages/
  auth/        AuthProvider, useAuth, guards, LoginForm, apiClient (Bearer + 401 refresh)  ← federation SINGLETON
  ui/          Tailwind component kit (Button, Input, Select, Card, Badge, Alert, Icon, ErrorBoundary…)
  contracts/   shared types: User, Role, ModuleManifest, RemoteAppProps, RemoteDefinition
  config/      tsconfig base, Tailwind theme tokens, shared-deps list + ports for federation
docs/ARCHITECTURE.md   standards, auth flow, how to add a module  ← read this
```

## Run

Requires Node 22.22+ (React Router 8 asks for it; 22.21 works but npm prints an engine warning).

```bash
npm install
npm run dev          # shell + all remotes with HMR → http://localhost:3000
npm run start        # production build + preview of all apps
npm run typecheck
```

Run one remote on its own, with real login and no shell: `npm run dev -w @mfe/users` → http://localhost:3001

### Demo accounts (also offered as one-click buttons on the login page)

| Role      | Username | Password     | Can do                              |
|-----------|----------|--------------|-------------------------------------|
| admin     | emilys   | emilyspass   | everything                          |
| moderator | oliviaw  | oliviawpass  | dashboard, view users (read-only)   |
| user      | averyp   | averyppass   | dashboard only (`/users` → 403)     |

DummyJSON simulates create, update and delete: it returns success but persists nothing.

Set `VITE_ACCESS_TOKEN_TTL_MIN=1` in `apps/shell/.env.local` to watch the silent refresh flow in DevTools.

## CI/CD: 1 repo, 3 pipelines

| Pipeline | File | Runs when these change | Deploys to Vercel project |
|---|---|---|---|
| shell | `.github/workflows/shell.yml` | `apps/shell/**`, `packages/**`, root `package*.json` | `myvizhi-mfe-shell` |
| users | `.github/workflows/users.yml` | `apps/users/**`, `packages/**`, root `package*.json` | `myvizhi-mfe-users` |
| dashboard | `.github/workflows/dashboard.yml` | `apps/dashboard/**`, `packages/**`, root `package*.json` | `myvizhi-mfe-dashboard` |

Pull request → **CI** (install, typecheck, build). Merge to `main` → CI → **deploy**.
A change in `apps/users` runs only the users pipeline. A change in `packages/` runs all 3.
Vercel's own Git auto-deploy is off (`"git": { "deploymentEnabled": false }` in each `vercel.json`), so the pipelines are the only way code reaches production.

## Deploy to Vercel (one-time setup)

Until this is done the deploy jobs **skip with a warning**, while CI still runs.

1. **Create 3 Vercel projects** (vercel.com → Add New → Project → import `myvizhi-design/MFE`), one per app:

   | Project name | Root Directory | Framework | Output |
   |---|---|---|---|
   | `myvizhi-mfe-shell` | `apps/shell` | Vite | `dist` |
   | `myvizhi-mfe-users` | `apps/users` | Vite | `dist` |
   | `myvizhi-mfe-dashboard` | `apps/dashboard` | Vite | `dist` |

   Add `VITE_API_BASE_URL=https://dummyjson.com` as an environment variable in each project.
   The first import may trigger one deployment from Vercel itself; it can be ignored.
2. **Create a Vercel token**: vercel.com → Account Settings → Tokens.
3. **Find the IDs**: Team/Account Settings → *Team ID* (= org ID), and each project → Settings → *Project ID*.
4. **Add GitHub secrets** (repo → Settings → Secrets and variables → Actions → *Secrets*):
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_SHELL`, `VERCEL_PROJECT_ID_USERS`, `VERCEL_PROJECT_ID_DASHBOARD`
5. **If Vercel gave a remote a different URL** than `https://<project-name>.vercel.app`, add repo *Variables*
   `USERS_URL` and/or `DASHBOARD_URL` with the real URLs (they feed the remote's `VITE_PUBLIC_URL` and the shell's registry).
6. **Deploy in order**: Actions → *users* → Run workflow, then *dashboard*, then *shell*.
   Open `https://myvizhi-mfe-shell.vercel.app`.

From then on every push to `main` deploys only the pipelines whose folders changed.
