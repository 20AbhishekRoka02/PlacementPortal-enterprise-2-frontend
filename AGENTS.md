<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project guidance

- Read [context.md](context.md) before changing application behavior. It summarizes the current route structure, data flow, and representative implementation files; verify details in source before relying on the snapshot.
- Keep backend communication in Next.js Route Handlers under `app/api/`. Client components should call same-origin `/api/...` endpoints, not `BACKEND_URL` or backend URLs directly. Route handlers forward requests to `process.env.BACKEND_URL` and preserve relevant status, response data, and cookies.
- Dashboard pages are wrapped by `app/dashboard/DashboardSidebarProvider.tsx`. Use `useDashboard()` for shared profile/loading state and account for staff versus student behavior where relevant. Do not treat client-side visibility or `proxy.ts` cookie checks as backend authorization.
- Follow existing App Router, TypeScript, Tailwind CSS, React Hook Form/Zod, and local UI component patterns. Use `lucide-react` for icons when appropriate; avoid adding dependencies or abstractions without need.
- Available scripts: `npm run dev`, `npm run build`, and `npm run lint`. There is no test script currently; run the narrowest relevant check and report any verification gap.
