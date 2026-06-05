# Fullstack Node — Backend

A RESTful Express.js backend for a collaborative project & task management system with real-time collaboration and an AI assistant powered by RAG (Retrieval-Augmented Generation). Users can create projects, manage team members with role-based access control, create and track tasks, write rich task content, and chat with an AI assistant that answers questions grounded in actual task data.

## Tech Stack

| Layer         | Technology                                          |
|---------------|-----------------------------------------------------|
| Runtime       | Node.js                                             |
| Framework     | Express.js v4.21                                    |
| Database      | MongoDB + Mongoose v8.8                             |
| Vector Search | MongoDB Atlas Vector Search                         |
| Auth          | JWT (Bearer token)                                  |
| Validation    | express-validator                                   |
| Password      | bcrypt                                              |
| Real-time     | Socket.IO                                           |
| AI Chat       | DeepSeek (primary) → GPT-4o-mini (fallback)         |
| Embeddings    | OpenAI `text-embedding-3-small` (1536 dims)         |
| Logging       | Winston + Morgan + express-winston                  |
| API Docs      | Swagger (swagger-jsdoc + swagger-ui-express)        |
| Config        | dotenv (per-environment files)                      |

## Features

### Core
- Project and task management with status, priority, and due dates
- Role-based access control (manager / editor / viewer)
- Rich task content editing (TipTap JSON format)
- Real-time collaborative editing via Socket.IO

### AI & RAG
- **Project AI chat** — conversational assistant scoped to a single project
- **Two retrieval strategies:**
  - `chunked` (default) — content split into 150-word overlapping chunks, each embedded independently; best for pinpointing specific facts
  - `single` — one embedding per task (full title + description + content); best for whole-task relevance
- **Automatic embedding pipeline** — content is embedded after each save (debounced 15s); `embeddingStale` flag triggers re-embed on next page visit after a server restart
- **Project summary** — dedicated endpoint generating structured summaries with pre-computed stats (completion %, overdue count, high-priority pending)
- **Debug mode** — `?debug=true` on the chat endpoint returns retrieved chunks and similarity scores (for development/testing)

## Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas account (free M0 tier works, but note: M0 supports max 3 Atlas Search indexes across the cluster)
- OpenAI API key (for embeddings and GPT-4o-mini fallback)
- DeepSeek API key (primary chat model)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/JxCl-L/fullstack-node.git
   cd fullstack-node
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.development.example .env.development
   ```
   Open `.env.development` and fill in your values:

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | MongoDB Atlas connection string |
   | `DATABASE_NAME` | Database name — only used by `npm run dev`. Can be any name (e.g. `fullstackTasks`) |
   | `JWT_SECRET` | Any long random string |
   | `OPENAI_API_KEY` | OpenAI API key — used for embeddings and GPT-4o-mini fallback |
   | `DEEPSEEK_API_KEY` | DeepSeek API key — primary chat model |
   | `CHUNK_CONFIGS` | JSON array of chunk versions, e.g. `[{"size":150,"overlap":50},{"size":150,"overlap":25}]` (default: single version size=300, overlap=50) |
   | `EMBEDDING_DEBOUNCE_MS` | Delay before re-embedding after a content save (default: `15000`) |

4. Seed the RAG test database
   ```bash
   node scripts/seed-rag-test.js
   ```
   This creates an isolated database (`fullstackTasks_rag_test`) with 1 project and 20 tasks with rich content — fully compatible with the current app schema including task content and embeddings.

5. Generate embeddings for the seeded tasks
   ```bash
   node scripts/backfill-embeddings-rag-test.js
   ```
   Add `--force` to wipe all existing chunk embeddings and re-generate from scratch (required when `CHUNK_CONFIGS` changes):
   ```bash
   CHUNK_CONFIGS='[{"size":150,"overlap":50},{"size":150,"overlap":25}]' \
     node scripts/backfill-embeddings-rag-test.js --force
   ```

6. Create the Atlas Search indexes on your cluster in the Atlas UI (Atlas Search tab):

   **Vector index** — `taskChunkEmbedding_vector_index` on `taskchunkembeddings` (database: `fullstackTasks_rag_test`):
   ```json
   {
     "fields": [
       { "type": "vector",  "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
       { "type": "filter",  "path": "project" },
       { "type": "filter",  "path": "chunkSize" },
       { "type": "filter",  "path": "chunkOverlap" }
     ]
   }
   ```

   **BM25 search index** — `taskChunkEmbedding_text_index` on `taskchunkembeddings` (required for hybrid strategy):
   ```json
   {
     "mappings": {
       "dynamic": false,
       "fields": {
         "chunkText":    { "type": "string" },
         "project":      { "type": "objectId" },
         "chunkSize":    { "type": "number" },
         "chunkOverlap": { "type": "number" }
       }
     }
   }
   ```

   **Vector index** — `taskContent_vector_index` on `taskcontents` (required for `single` strategy):
   ```json
   {
     "fields": [
       { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
       { "type": "filter", "path": "task" }
     ]
   }
   ```
   > **M0 free tier limit:** max 3 search indexes per cluster total.

7. Start the development server
   ```bash
   npm run dev:rag-test
   ```

The server will run on `http://localhost:3001`

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev:rag-test` | Start dev server using `fullstackTasks_rag_test` — **use this for development** |
| `npm run dev` | Start dev server using `DATABASE_NAME` from `.env.development` |
| `npm run start` | Start production server |
| `npm run eval:rag` | Run RAG strategy comparison eval (requires server running via `dev:rag-test`) |

Test queries covering date facts, numbers, attribution, multi-chunk retrieval, strategy comparison, and edge cases are in `src/ai/chat/chat-rag-test.http`. Append `?debug=true` to any chat request to see retrieved chunks and similarity scores in the response.

## Demo Accounts

After seeding, you can log in with any of these accounts (all use password `Password123#`):

| Name    | Email               | Role in Project A |
|---------|---------------------|-------------------|
| Alice   | alice@example.com   | Manager           |
| Bob     | bob@example.com     | Editor            |
| Charlie | charlie@example.com | Viewer            |

## API Documentation

Swagger UI is available at:
```
http://localhost:3001/api-docs
```

## Performance

### Database Indexes

The Task model defines indexes to avoid full collection scans on every query:

```js
taskSchema.index({ project: 1 });                // all queries filter by project
taskSchema.index({ project: 1, status: 1 });     // status counts + filtered list
taskSchema.index({ project: 1, createdAt: -1 }); // sort desc
taskSchema.index({ project: 1, createdAt: 1 });  // sort asc
```

These become significant as task collections grow — without them every query scans the entire collection.

### $facet Aggregation for Task Counts

The `GET /tasks` endpoint previously ran **7 sequential database round-trips** per request (1 auth check + 5 count queries + 1 find). On MongoDB Atlas the network round-trip alone costs ~40ms per query.

The 5 `countDocuments()` calls were replaced with a single `$facet` aggregation that computes all counts in one round-trip:

```js
Task.aggregate([
  { $match: { project: projectId } },
  { $facet: {
    total:      [{ $count: "count" }],
    completed:  [{ $match: { status: "completed"  } }, { $count: "count" }],
    todo:       [{ $match: { status: "todo"        } }, { $count: "count" }],
    inProgress: [{ $match: { status: "inProgress" } }, { $count: "count" }],
    filtered:   [{ $match: { status: { $in: statusArray } } }, { $count: "count" }],
  }},
])
```

### Benchmark (local server → MongoDB Atlas M0)

| Metric | Before | After | Improvement |
|---|---|---|---|
| Count queries (5 → 1) | ~210ms | ~44ms | **~166ms saved** |
| Total per request | ~370ms | ~181ms | **~51% faster** |

> Measured with `Date.now()` logs around each query. Numbers are averages across multiple project fetches.

---

## Project Structure

```
src/
├── ai/
│   ├── chat/                         # AI chat endpoint
│   │   ├── chat.provider.js          # RAG retrieval + LLM call
│   │   ├── chat.router.js
│   │   ├── chat.validator.js
│   │   └── chat-rag-test.http        # Test queries with debug mode
│   ├── aiClient.js                   # DeepSeek + OpenAI clients
│   ├── chunker.js                    # Word-based sliding window chunker
│   ├── embeddingDebouncer.js         # Debounces re-embedding on content saves
│   └── generateTaskEmbeddings.js    # Generates chunked + single embeddings
├── users/
├── projects/
├── projectMembers/
├── tasks/
├── taskContent/
│   ├── taskContent.schema.js         # Stores TipTap content + single embedding
│   └── taskChunkEmbedding.schema.js  # Stores per-chunk embeddings for vector search
└── settings/
scripts/
├── seed-rag-test.js                  # Seeds fullstackTasks_rag_test — use this
├── backfill-embeddings-rag-test.js   # Generates embeddings for RAG test dataset (--force to rebuild)
├── rag-eval.js                       # RAG strategy comparison runner (outputs .json + .md report)
├── rag-eval-cases.json               # Eval test cases (questions + expected retrieval targets)
└── seed.js                           # Legacy seed (outdated schema — do not use)
```

## Role-Based Access

| Role    | View | Edit | Manage Members | AI Chat |
|---------|------|------|----------------|---------|
| Manager | ✅   | ✅   | ✅             | ✅      |
| Editor  | ✅   | ✅   | ❌             | ✅      |
| Viewer  | ✅   | ❌   | ❌             | ✅      |
