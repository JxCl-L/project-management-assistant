# project-management-assistant

AI-powered project & task management — monorepo housing the server, client, and a shared schema package.

## Layout

```
apps/
  server/    Node + Express + MongoDB API (was project-management-app-server)
  client/    React + Vite SPA (was project-management-app-client)
packages/
  schemas/   Shared zod schemas consumed by both apps (@pm/schemas)
```

## Branches

- `main` — active development of both apps.
- `eval-archive` — full RAG evaluation state for `apps/server`: analyzer scripts (`scripts/analyzers/`), eval results (`scripts/results/`), curated reports (`scripts/reports/`), and HTML viewers (`scripts/viewers/`). Kept off `main` to avoid bloating the working tree. Check out this branch when restoring or iterating on the analyzers.

## Getting started

```bash
npm install
# workspaces wire @pm/schemas into both apps automatically
```

## History

This repo is a monorepo migration of two previously independent repos. Full pre-migration history is preserved via `git subtree` imports and remains visible in `git log`. The originals (archived, read-only) live at:

- `JxCl-L/project-management-app-server`
- `JxCl-L/project-management-app-client`
