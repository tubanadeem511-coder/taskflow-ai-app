# TaskFlow AI

TaskFlow AI is a lightweight task-management frontend for organizing a personal task list, tracking current progress, and reviewing a snapshot of task statistics. Tasks are stored in the browser; this project is a frontend prototype, not a hosted or multi-user task service.

## Features

- Create tasks with title validation; blank and whitespace-only titles are rejected.
- Search task titles without regard to letter case.
- Filter tasks by Pending, In Progress, or Completed status.
- Advance a task through Pending → In Progress → Completed → Pending; edit or delete tasks.
- View task counts and completion percentage.
- Review current status and priority breakdowns, calculated from the task list.
- Keep task changes in this browser's local storage (`taskflow.tasks.v1`).

New browser profiles start with example tasks. Analytics describe the current list only; they are not historical reports.

## Technology

- React 19 and React DOM
- Vite 8 with the React plugin
- JavaScript ES modules and CSS
- npm
- Node.js built-in test runner (`node --test`)

## Prerequisites

- Node.js 20.19 or later in the 20.x line, or 22.12 or later.
- npm (included with Node.js).

These versions meet the Node.js engine requirement of the Vite version used by this project.

## Local setup

From the project directory, install the exact dependency versions in `package-lock.json`:

```sh
npm ci
```

## Development server

Start Vite:

```sh
npm run dev
```

Open the local address printed in the terminal (Vite defaults to `http://localhost:5173/`).

## Tests

Run the automated tests:

```sh
npm test
```

The tests use Node's built-in test runner and cover task utilities and route resolution.

## Production build

Create the production bundle:

```sh
npm run build
```

Vite writes the output to `dist/`. To serve that build locally, run:

```sh
npm run preview
```

Deployments that serve the app from a static host should configure SPA history fallback to `index.html` so direct navigation and refreshes on app routes work.

## Routes

- `/` — public landing page
- `/app` — task workspace
- `/analytics` — task analytics

Both `/app` and `/app/` open the task workspace; both `/analytics` and `/analytics/` open analytics. This trailing-slash behavior was fixed in KAN-4 and is covered by the route tests.

## Integrations and limitations

- **Jira and GitHub:** The coding-agent workspace has Atlassian MCP tools for Jira and GitHub MCP tools for repository workflows. These are external development tools, not application integrations. The frontend has no Jira or GitHub client, API connection, or synchronization; a sample task mentioning these services is example content only.
- **MCP:** MCP tool access is configured in the agent environment, not bundled or configured by this application. The app does not connect to an MCP server.
- **Data and accounts:** There is no backend, database, authentication, account, organization, or cloud sync. Task data stays in browser local storage and is not shared across browsers or devices.
- **Analytics:** Statistics are derived from the current task list. There is no activity history, date-range reporting, or historical trend data.
- **Other integrations:** No AI provider or Supabase integration is implemented.

Do not use the current prototype to store sensitive or organization-confidential data.
