# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (Next.js on port 3000)
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (no emit, type errors only)
npm run test         # vitest (run all tests)
npx vitest run lib/__tests__/smoke.test.ts  # Run a single test file
```

Database:
```bash
npx prisma migrate dev   # Apply pending migrations + regenerate client
npx prisma studio        # Browse the database in a GUI
npx prisma generate      # Regenerate client after schema changes
```

## Architecture

**Stack:** Next.js 16 (App Router), React 19, Prisma 7 with PostgreSQL via `pg` pool + `@prisma/adapter-pg`, NextAuth v5 (beta), Tailwind CSS v4, Zod, Vitest.

**Important:** This repo uses Next.js 16 which may have breaking changes from previous versions. Read `node_modules/next/dist/docs/` before making assumptions about Next.js APIs.

### Auth

Two-file split required by Next.js edge middleware constraints:

- [auth.config.ts](auth.config.ts) — edge-safe config (Google OAuth, JWT callbacks, redirect logic). Imported by middleware.
- [auth.ts](auth.ts) — full server-only auth (adds Prisma adapter, Credentials provider with bcrypt). Never imported in middleware.

Session strategy is JWT. The session callback copies `id` and `role` from the JWT token onto `session.user`. Types are extended in [types/next-auth.d.ts](types/next-auth.d.ts).

Route protection lives in [middleware.ts](middleware.ts): public routes are `/, /login, /signup, /features, /pricing`. Everything else redirects to `/login` when unauthenticated.

### Data Layer

- [lib/db.ts](lib/db.ts) — singleton Prisma client using `pg` connection pool + `PrismaPg` driver adapter. Uses `globalThis.prisma` to prevent hot-reload connection leaks.
- [prisma/schema.prisma](prisma/schema.prisma) — models: `User` (role: USER/ADMIN/SUPERADMIN), `Account`, `Session`, `VerificationToken` (NextAuth adapter tables), `Link` (user's links with click tracking + draft flag), `Profile` (per-user layout/theme settings).
- A `Profile` row is always created alongside a `User` — for OAuth via the `createUser` event in [auth.ts](auth.ts), for credentials via [app/actions/auth.ts](app/actions/auth.ts).

### Server Actions

All mutations go through Next.js Server Actions in [app/actions/](app/actions/):
- [auth.ts](app/actions/auth.ts) — `registerUser`, `loginWithCredentials`, `checkUserExists`
- [links.ts](app/actions/links.ts) — `getLinks`, `addLink`, `updateLink`, `deleteLink`, `getProfile`

All link actions call `auth()` to enforce session ownership; writes call `revalidatePath("/user-dashboard")`.

### Page / Client Pattern

Pages are thin server components that render a `*Client.tsx` file:

- `/user-dashboard` and `/user-admin` both render `UserAdminClient` — the dashboard is a redirect alias.
- `/appearance` → `AppearanceClient.tsx`
- `/links` → `LinksClient.tsx`
- `/analytics`, `/user-analytics` — analytics views
- `/super-admin` — SUPERADMIN-only management UI

Client components own local state and call server actions directly. The split follows Next.js App Router conventions: server component fetches/passes data, client component handles interactivity.

### UI Architecture

**Layout shell:** Every authenticated page wraps in `<CollapsibleSidebar>` + `<AppHeader>` + `<LinksStyleTwoColumnLayout>`. The sidebar collapse state comes from `SidebarContext`.

**Live preview:** `MobilePreview` ([app/components/MobilePreview.tsx](app/components/MobilePreview.tsx)) renders a phone-frame mock of the user's public profile. It accepts an `AppearanceState` object and injects scoped CSS for per-theme styles. All editor pages show this in the right column via `LinksPreviewPanel`.

**Theme system:** Theme presets are defined in [app/constants/themePresets.ts](app/constants/themePresets.ts) as full `AppearanceState` snapshots. `MobilePreview` computes background gradients and button/card CSS dynamically per `themeId`. The app-wide dark/light toggle is handled by a `<script>` tag in [app/layout.tsx](app/layout.tsx) (reads `localStorage("theme")`) plus `ThemeToggle`.

**Design tokens:** Tailwind uses semantic color tokens like `bg-surface`, `text-on-surface`, `text-primary`, `bg-surface-container-*` — these map to CSS variables in [app/globals.css](app/globals.css).

**Icons:** Google Material Symbols Outlined loaded as a stylesheet (not via `next/font`). Use `<span className="material-symbols-outlined">icon_name</span>`.

### Path Aliases

`@/` maps to the project root (configured in [tsconfig.json](tsconfig.json)).
