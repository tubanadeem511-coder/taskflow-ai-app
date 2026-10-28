---
name: safe-taskflow-development
description: "Use when fixing bugs or implementing features in TaskFlow AI, especially organization, request, project, task, auth, database, or analytics work."
argument-hint: "Describe the TaskFlow bug or feature and any relevant route or role"
user-invocable: true
---

# Safe TaskFlow Development

Make focused, verifiable changes to the existing TaskFlow AI application without weakening tenant isolation or replacing working behavior.

## Procedure

1. **Inspect first.** Read the package scripts, affected components, utilities, tests, and relevant documentation. Check repository status and existing Supabase migrations/configuration when available. Never print environment values or credentials.
2. **Understand the behavior.** Trace the affected UI, data flow, and authorization boundary. For a bug, reproduce it with a focused test or browser workflow before editing.
3. **Check the integration boundary.** Confirm which backend, schema, auth session, and organization context are actually configured. Do not substitute local demo data or client-side role checks for server authorization.
4. **Make the smallest complete change.** Preserve unrelated features and existing data. Keep secrets server-side. Treat database changes as additive unless a separately reviewed migration explicitly authorizes otherwise.
5. **Add or update tests.** Cover expected behavior, invalid input, failures, empty data, and relevant role or organization boundaries. Do not claim RLS or integration coverage without executing it against a safe test project.
6. **Run validation.** Use the repository's configured targeted tests, full tests when appropriate, and production build. Report commands that were unavailable or blocked.
7. **Review security and regressions.** Check authorization at the trusted boundary, organization scoping, input validation, file handling, accessible feedback, and responsive behavior. Do not expose tokens or private records.
8. **Summarize honestly.** List changed files, behavior, checks and their actual results, migration/configuration requirements, and unresolved limitations.

## Safety constraints

- Never place Supabase service-role keys, AI provider keys, or access tokens in client code, browser storage, fixtures, or documentation examples.
- Never grant elevated roles from signup data or trust a client-supplied organization ID without authorization.
- Never disable RLS to make a workflow pass.
- Never apply migrations to an unknown or production database, or run destructive test operations against production.
- Do not fabricate Jira issues, GitHub links, model responses, test results, or deployment status.
