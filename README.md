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

## RAG evaluation

The RAG evaluation pipeline and its history live on `main` under `apps/server/scripts/`:

- `analyzers/` — eval runner, gold-fact builder, root-cause analysis and HTML viewer generators
- `results/` — raw eval outputs (JSON), classifier results and targeted reruns
- `reports/` — hand-graded review reports for each run (start here)
- `viewers/` — generated HTML viewers for browsing results

These used to live on a separate `eval-archive` branch; that snapshot is preserved as the tag `archive/eval-2026-06`. See `apps/server/README.md` for how to run the pipeline.

## Getting started

```bash
npm install
# workspaces wire @pm/schemas into both apps automatically
```

## Running from the root

You don't need to `cd` into `apps/server` or `apps/client` for the common dev flows:

```bash
npm run dev:server   # apps/server (uses fullstackTasks_rag_test database)
npm run dev:client   # apps/client (Vite)
npm run build:client # production build of the client
npm run lint:client
npm run seed:server  # reset and seed fullstackTasks_rag_test
npm run eval:rag     # run the RAG evaluation pipeline
```

> Both `dev:server` and `seed:server` target the `fullstackTasks_rag_test` database. The schema changes in the AI/RAG branch are incompatible with the older `fullstackTasks` data, so the rag-test database is the only supported dev/seed target on this branch.

To run server + client side by side, open two terminals and run `npm run dev:server` in one, `npm run dev:client` in the other.

## History

This repo is a monorepo migration of two previously independent repos. Full pre-migration history is preserved via `git subtree` imports and remains visible in `git log`. The originals (archived, read-only) live at:

- `JxCl-L/project-management-app-server`
- `JxCl-L/project-management-app-client`
