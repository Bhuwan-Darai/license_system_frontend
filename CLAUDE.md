# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # serve the production build
npm run lint     # eslint (flat config, eslint.config.mjs)
npx tsc --noEmit # type check; there is no test runner configured
```

Next.js is 16.x with React 19 — per AGENTS.md, read the matching guide in `node_modules/next/dist/docs/` before using or changing Next APIs.

## Environment

`.env*` uses `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_NODE_ENV`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. In `app/utils/axios.ts` the API base URL is `NEXT_PUBLIC_API_URL` only when `NEXT_PUBLIC_NODE_ENV === "production"`; otherwise it is hard-coded to `http://localhost:3030/api/v1` (the separate backend). Supabase is used for file/image storage (`app/utils/supabase.ts`). `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is the reCAPTCHA v3 site key for the contact form; without it the script isn't loaded and no token is sent (the backend then only accepts that outside production).

## Architecture

Frontend for a Nepali driving-license system: a public marketing site plus an admin dashboard. App Router, TypeScript, Ant Design 6 + Tailwind 4, TanStack Query, axios. Path alias `@/*` → repo root.

### Route groups (`app/`)
- `(public)` — website (`home`, `about`, `blog`, `contact`, `pricing`, `services`), server-rendered for SEO. Layout supplies header/footer; pages use `loading.tsx` for streaming. `next.config.ts` redirects `/` → `/home`. SEO helpers in `app/lib/seo.ts`, `sitemap.ts`, `robots.ts`.
- `(auth)` — `login`, `register`, `verify` (OTP). These and `/dashboard/*` are sent `noindex` via `next.config.ts` headers.
- `dashboard/*` — admin UI. Pages are thin; the real screens live in `app/components/Dashboard/<Feature>/` (Blog, ExamManager, Registration, IshiharaPlates, Symbols, RoleManager, Message, etc.). `app/dashboard/layout.tsx` wraps them in Sidebar/Header/`ProtectedRoute`/`RouteGuard`.
- `(test)` — scratch pages.

### Contact form
`app/components/LandingPage/ContactForm.tsx` posts via `app/utils/inquiry.ts` to the public `POST /public/inquiries` using its own plain axios client (no cookies/toasts). Spam defences: a hidden honeypot field (`website`) and reCAPTCHA v3 — the script is loaded with `next/script` only on this page, and `sendInquiry` fetches a fresh token (action `contact`) per submit and sends it as `recaptcha_token`. The backend verifies it (`pkg/recaptcha`); the action name must match on both sides. Client validation in `validateInquiry` mirrors the server rules.

### Providers (`app/utils/providers.tsx`)
Query client → Theme → Language → antd `ConfigProvider` (locale + dark algorithm follow app state) → `AuthProvider` → `AuthGuard`. `AuthGuard` (`app/components/AuthGurad.tsx`, note spelling) keeps `OPEN_ROUTES` (public pages) unauthenticated and redirects guests to `/login` and signed-in users away from `GUEST_ONLY_ROUTES`. **Adding a new public page requires adding its prefix to `OPEN_ROUTES`.**

### Auth and permissions
- Auth is cookie-based (`withCredentials`); no token handling in the client. `api` in `app/utils/axios.ts` is the single axios instance; its response interceptor shows antd toasts for 403/404/5xx and redirects to `/login` on 401 (except `/auth/me`, `/auth/login`).
- Permissions are string codes `<MODULE>_<ENTITY>_<ACTION>` (e.g. `DASHBOARD_STATS_LIST`) that must match backend `pkg/permissions`. The catalog is served by `GET /permission`. Check with `isAllowed(code | codes[])` from `useAuthContext()` / `usePermissions().can` (array = any one suffices).
- `config/route.tsx` is the single source for the sidebar menu **and** page guarding: each `Route` has a `permission`; `usePermissions().filterRoutes` hides menu entries and `RouteGuard` blocks pages via `findRouteForPath`. A new dashboard page needs an entry here.
- `app/lib/accessCache.ts` caches permission codes in localStorage (via `useSyncExternalStore`) so the menu renders before `/auth/me` returns; it is only a cache. `usePermissionStream.ts` subscribes to SSE `GET /auth/permissions/stream` so role changes apply live without re-login. `useWebPush.ts` handles web push.

### i18n (English / Nepali)
Custom, no library. Dictionaries in `app/i18n/messages/{en,ne}.ts` (`en` defines the `Messages` type — add keys to both). Language lives in the `lang` cookie so the server renders the right language on first paint: Server Components use `getI18n()` from `app/i18n/server.ts`, client components use `useI18n()` from `LanguageContext`. Dashboard text is largely not translated yet. `toLocaleDigits` converts to Devanagari digits. Dates use Bikram Sambat libraries (`nepali-date-converter`, `bikram-sambat-*`, `@bhuwan_darai/nepali-date-react`).

### Theme
`ThemeContext` supports light/dark and font size, with `themeInitScript` in the root layout to avoid flash; user preferences (`theme`, `font_size`, `language`) are saved on the account and applied in the dashboard layout. The dashboard layout also overrides antd dark tokens for text colour.
