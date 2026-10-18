# Project Context

This is a Next.js App Router frontend for a placement portal with staff and student experiences. Treat this file as a navigation aid, not a substitute for checking the implementation when behavior changes.

## Stack And Commands

- Next.js `16.2.9`, React `19.2.4`, TypeScript, Tailwind CSS 4, Radix-based UI components, and `lucide-react`.
- `npm run dev` starts the development server; `npm run build` builds the app; `npm run lint` runs ESLint. There is no test script in `package.json`.
- Follow the Next.js version-specific documentation requirement in [AGENTS.md](AGENTS.md); consult `node_modules/next/dist/docs/` before changing Next.js APIs or conventions.

## Application Structure

- `app/` contains App Router pages and server-side API Route Handlers. `components/` contains shared forms, dashboard components, and UI primitives; `lib/utils.ts` provides shared utilities.
- The dashboard routes include jobs, job creation/details, applications/details, and profile: `app/dashboard/`. Students use `/dashboard/application/[slug]`; staff application details are nested at `/dashboard/job/[slug]/application/[applicationSlug]`.
- Staff and student UI behavior is informed by the profile's `is_staff` flag. [app/dashboard/DashboardSidebarProvider.tsx](app/dashboard/DashboardSidebarProvider.tsx) fetches `/api/profile` once and provides `profile` and `profileLoading` through `useDashboard()`. Dashboard descendants should use that context rather than independently fetching the shared profile.
- [components/dashboard/app-sidebar.tsx](components/dashboard/app-sidebar.tsx) shows staff a Jobs link and students Jobs and Applications links. The Jobs page exposes job creation to staff. These are UI distinctions, not authorization controls.
- Staff application rows on [app/dashboard/job/[slug]/page.tsx](app/dashboard/job/%5Bslug%5D/page.tsx) open the nested job/application route. Both staff and student routes render [components/dashboard/application/ApplicationDetailView.tsx](components/dashboard/application/ApplicationDetailView.tsx), which fetches the existing application detail API; staff presentation uses applicant-focused resume/contact labels. [components/dashboard/breadcrumbs.tsx](components/dashboard/breadcrumbs.tsx) shows the nested staff route as Jobs > Job ID > Application ID, with the job breadcrumb linking back to the job detail/application list.
- [proxy.ts](proxy.ts) checks for `access` and `refresh` cookies before allowing `/dashboard` paths, sends unauthenticated users to `/auth/login`, redirects authenticated users away from `/auth/login`, and redirects `/` and `/dashboard` to `/dashboard/job`. It does not validate roles or replace backend authorization.

## Data And Auth Flow

- Keep browser-to-server calls same-origin: client components call `/api/...`; `app/api/**/route.ts` handlers communicate with the backend using `BACKEND_URL`. This keeps backend URLs and cookie forwarding in the server-side boundary. Follow neighboring handlers for method, payload, cookie, status, and error forwarding.
- Existing API handler groups cover authentication, profile, jobs, applications, resumes, companies, batches, and job attributes. Dynamic job and application handlers are under their respective `[slug]` folders.
- Staff application exports use same-origin handlers under `app/api/application-exports/` for triggering an export, checking its status, and streaming its ZIP download. The job detail page polls active exports, displays step/progress, and downloads the ZIP when complete; the backend remains responsible for staff authorization.
- Job creation loads existing batches through `/api/batches` and selects one batch; batch creation is not part of the job form.
- Login and forgot-password form behavior lives in [components/login-form.tsx](components/login-form.tsx). Login and logout use internal auth routes; the forgot-password request uses `/api/auth/forgot-password`.
- The reset link resolves to `/reset-password/[uid]/[token]` in [app/reset-password/[uid]/[token]/page.tsx](app/reset-password/[uid]/[token]/page.tsx), which posts the `uid`, `token`, and new password values to `/api/auth/forgot-password/confirm`. The Route Handler forwards to the backend password-reset confirmation endpoint.
- [app/api/profile/route.ts](app/api/profile/route.ts) combines the authenticated user's role/profile response with the student profile when applicable; profile updates are forwarded from this same-origin handler.

## Representative Patterns

- Login form validation and request handling: [components/login-form.tsx](components/login-form.tsx).
- Shared dashboard profile context and shell: [app/dashboard/DashboardSidebarProvider.tsx](app/dashboard/DashboardSidebarProvider.tsx).
- Dashboard data-table usage and role-dependent job action: [app/dashboard/job/page.tsx](app/dashboard/job/page.tsx).
- Backend proxy with cookie forwarding and multipart form data: [app/api/resumes/route.ts](app/api/resumes/route.ts).
- Password-reset token form and confirmation request: [app/reset-password/[uid]/[token]/page.tsx](app/reset-password/[uid]/[token]/page.tsx).

## Current Scope Notes

- Both `/login` and `/auth/login` pages exist. `proxy.ts` currently redirects unauthenticated dashboard traffic to `/auth/login`; verify both routes before changing auth navigation.
- The root `README.md` is the generic create-next-app guide and does not document portal-specific behavior. Keep this file concise and update it when routes, data boundaries, or shared app architecture materially change.