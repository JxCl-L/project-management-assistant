# Fullstack React — Frontend

A collaborative project & task management app with real-time editing and an AI assistant powered by RAG (Retrieval-Augmented Generation). Users can create projects, manage team members with role-based access, create and track tasks with rich content, and chat with an AI assistant that answers questions grounded in actual task data.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | React 19 + Vite                     |
| Routing      | React Router v7                     |
| Server State | TanStack React Query v5             |
| Client State | URL params + cookies                |
| Forms        | React Hook Form + Zod validation    |
| UI           | Radix UI + Tailwind CSS (shadcn/ui) |
| Theming      | CSS variables (Light / Dark / Solarized Light) |
| HTTP         | Axios with interceptors             |
| Auth         | JWT stored in cookies               |
| AI rendering | ReactMarkdown                       |

## Features

- **Authentication** — register, login, logout (with confirmation dialog) using JWT
- **Projects** — create and manage projects with a collapsible sidebar (state persisted across sessions); project name and description are inline-editable directly from the tasks header
- **Role-based access** — manager / editor / viewer permissions enforced on both UI and API
- **Tasks** — create tasks with title, description, priority, status, and due date; all fields inline-editable on the task detail page
- **Progress bar** — segmented bar showing todo / in-progress / completed counts and overall completion percentage
- **Rich text editor** — task content powered by Tiptap with bold, italic, lists, and strikethrough
- **Real-time collaboration** — live content updates and presence indicators via Socket.IO
- **AI chat panel** — project-scoped assistant with RAG retrieval, markdown rendering, and multi-turn conversation
- **Project summary** — one-click AI-generated project status with completion stats and recommended next steps
- **Themes** — Light, Dark, and Solarized Light themes switchable from the sidebar footer; choice is persisted to `localStorage` and applied before first render to avoid flash

## Getting Started

### Prerequisites

- Node.js
- The backend running locally — [Backend repo](https://github.com/JxCl-L/fullstack-node)
  - Follow the backend README to seed the RAG test database and start `npm run dev:rag-test`

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/JxCl-L/project-management-app-client
   cd project-management-app-client
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Make sure `VITE_API_URL` points to your local backend (default: `http://localhost:3001`)

4. Start the development server
   ```bash
   npm run dev
   ```

The app will run on `http://localhost:5173`

## Demo Accounts

Log in with any of these accounts (password: `Password123#`):

| Name    | Email               |
|---------|---------------------|
| Alice   | alice@example.com   |
| Bob     | bob@example.com     |
| Charlie | charlie@example.com |

## Performance — Lazy Loading

Heavy components are code-split and loaded on demand so the initial page load is as light as possible.

| Chunk | Size | Loads when |
|---|---|---|
| `index.js` (app shell) | 289 KB | Always |
| `taskContentEdit` (TipTap editor) | 383 KB | First visit to a task detail page |
| `aiPanel` (react-markdown + AI chat) | 127 KB | First click of the AI button |
| `tasks`, `task`, `login`, etc. | 1–64 KB each | When that route is navigated to |

**The AI panel chunk is prefetched in the background after tasks data loads**, so by the time the user clicks the AI button the chunk is already cached and opens instantly.

### Benchmark (Chrome DevTools, cache disabled, dev mode)

| Metric | Before lazy loading | After lazy loading | Improvement |
|---|---|---|---|
| DOMContentLoaded | 354 ms | 192 ms | **45% faster** |
| Load | 650 ms | 353 ms | **46% faster** |
| JS transferred | 7.6 MB | 6.2 MB | **1.4 MB less** |

> Tested by refreshing the tasks page with "Disable cache" enabled in Chrome DevTools Network tab.
> Numbers are from dev mode — production (minified + compressed) would show greater improvement.

### How it works

Route-level lazy loading in `routes.jsx` — every page is its own chunk via `React.lazy()`:

```js
const Tasks = lazy(() => import("./pages/tasks/tasks.jsx"));
const Task  = lazy(() => import("./pages/task/task.jsx"));
```

Heavy components inside pages follow the same pattern:

```js
// AI panel — split from tasks page
const AiPanel = lazy(() =>
  import("@/components/aiPanel/aiPanel.jsx").then(m => ({ default: m.AiPanel }))
);

// TipTap editor — split from task detail page
const TaskContentEdit = lazy(() => import("@/components/taskContentEdit/taskContentEdit.jsx"));
```

`ReactQueryDevtools` is excluded from production builds entirely via a conditional dynamic import.

---

## AI Chat Panel

The AI assistant is available on the tasks page via the **AI** button in the top right. It is scoped to the current project and powered by RAG — answers are grounded in actual task content rather than general knowledge.

**How it works:**
- Every chat message embeds the query and retrieves the most semantically relevant task content chunks via Atlas Vector Search
- Retrieved chunks are injected into the LLM context alongside a full task overview (title, status, priority, due date for all tasks)
- Replies are rendered as markdown (bold, lists, code blocks, headings)
- Conversation history is maintained across turns so follow-up questions work naturally
- Clicking **Summarize this project** fires a dedicated summary endpoint with pre-computed stats (completion %, overdue count) and also enters the conversation history for follow-up

**RAG strategy toggle:**
A toggle above the input lets you switch between four retrieval strategies:
- `chunked` (default) — splits content into 150-word overlapping chunks; best for pinpointing specific facts
- `single` — one embedding per full task; best for whole-task relevance
- `hybrid` — combines chunked and single retrieval for broader coverage
- `fullcontext` — sends all task content as full context without retrieval; best for small projects where everything fits in the LLM context window
