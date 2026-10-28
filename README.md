# TaskFlow AI

TaskFlow AI is a React task workspace with a public product landing page, a browser-local task manager, and a live snapshot of task status and priority. Its current tagline is **Manage Requests. Track Progress. Resolve Faster.** The current implementation is a frontend prototype; it is not yet a multi-organization service desk.

## Current features

- Public landing page at `/`.
- Task workspace at `/app`: create, rename, delete, search, filter, and cycle task statuses.
- Analytics at `/analytics`: current task totals, completion rate, status breakdown, priority mix, and a summary table.
- Responsive layouts, keyboard focus styling, reduced-motion support, TaskFlow logo and favicon.
- Task persistence in browser `localStorage` under `taskflow.tasks.v1`.

The starter tasks are example content shown to a new browser profile. Analytics are calculated from the current task list only. There are no historical timestamps, date filters, account identities, or remote records.

## Roles and data boundaries

The requested Owner, Admin/Manager, Agent, and Member roles are **not implemented**. There is no authentication or authorization, and localStorage is not a secure or shared database. Do not use the current build to store sensitive institute or company data.

## Technology

- React 19
- Vite 8
- JavaScript ES modules
- npm
- Node's built-in test runner (`node --test`)

No Supabase, charting, AI-provider, or Jira/GitHub integration package is currently configured. No server/API is present.

## Prerequisites and local development

Install a Node.js release supported by the installed Vite version and npm, then run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Existing routes use the browser History API; a static production host must rewrite `/app` and `/analytics` to `index.html` for direct navigation and refreshes.

## Tests and production build

```sh
npm test
npm run build
npm run preview
```

The build output is written to `dist/`. Deploy that directory to a static host configured with SPA history fallback.

## Supabase status and planned setup

There is currently no Supabase project configuration, client, migration, schema, Storage bucket, Auth flow, or RLS policy in this repository. No existing Supabase tables or data were discovered in the project files. A live Supabase project and its schema could not be inspected from this workspace.

`.env.example` lists public client variable names with placeholders for future setup; these variables are not consumed by the current application. To proceed with the multi-organization implementation:

1. Create or identify a Supabase project and confirm that it is the intended target. Do not provide a service-role key to the browser or commit credentials.
2. Review the existing project's tables, Auth configuration, and Storage buckets before preparing additive migrations. Back up existing data and use a non-production project for policy tests.
3. Add database migrations for profiles, organizations, memberships, projects, requests, tasks, comments/history, and notifications. Use RLS on every exposed table; derive permissions from authenticated membership, not frontend role state.
4. Add Supabase Auth and a data-access layer, then migrate existing local tasks only through an explicit, user-controlled import.
5. Configure a private attachment bucket and policies, upload constraints, and short-lived signed downloads.
6. Test tenant isolation and denied cross-organization reads/writes against the safe Supabase test project before deploying.

The current frontend has no trusted server or edge function. Never put a Supabase service-role key or AI provider secret in a `VITE_*` variable. Inviting users through Supabase Admin APIs, secure AI calls, and other privileged operations require a separately deployed server or edge function.

## AI assistance

No model integration is implemented. No request or organization data is sent to an AI provider. AI suggestions remain unavailable until a server-side provider integration, privacy policy, access controls, and provider credentials are configured.

## Jira, GitHub, and coding-agent workflow

The project folder was reported by the workspace environment as not being a Git repository; no commit or push can be made from that state. No Jira MCP integration or Jira project was available in the active tool configuration, so Jira tasks, issue links, and a real Jira-to-code demonstration have not been created. GitHub/MCP availability and repository authorization must be confirmed before linking or publishing code.

The reusable workspace Skill is at [`.github/skills/safe-taskflow-development/SKILL.md`](.github/skills/safe-taskflow-development/SKILL.md). It documents the inspect/reproduce/focus/test/security-review workflow. The Skill file itself is a project customization; confirm the selected coding agent loads workspace skills before relying on automatic invocation.

## Deployment and security notes

- Deploy `dist/` to a static host with SPA fallback and HTTPS.
- Browser-local task data is isolated by browser profile and origin, can be removed by the user, and is not encrypted or backed up by this app.
- Do not enter private, regulated, or organization-confidential data into the current frontend.
- Before offering this as a multi-tenant production service, implement and independently test authentication, server-enforced authorization, RLS, private Storage, audit history, backups, and operational monitoring.

## Known limitations

- No signup, login, password recovery, profiles, organizations, invitations, or organization switching.
- No request/complaint workflow, comments, assignment, attachments, or status history.
- No projects, membership, subtasks, or Kanban board.
- No role-specific dashboards, notifications, or server/database analytics.
- No date-range or historical charts, CSV export, or AI assistance.
- No configured Supabase, email, AI, Jira, or GitHub integration.
- No Git checkpoint can be created until the project is in an authorized repository.
