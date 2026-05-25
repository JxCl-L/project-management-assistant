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
| HTTP         | Axios with interceptors             |
| Auth         | JWT stored in cookies               |
| AI rendering | ReactMarkdown                       |

## Features

- **Authentication** — register, login, logout with JWT
- **Projects** — create and manage projects with a collapsible sidebar (state persisted across sessions)
- **Role-based access** — manager / editor / viewer permissions
- **Tasks** — create tasks with title, description, priority, status, and due date
- **Rich text editor** — task content powered by Tiptap
- **Real-time collaboration** — live content updates via Socket.IO
- **AI chat panel** — project-scoped assistant with RAG retrieval, markdown rendering, and multi-turn conversation
- **Project summary** — one-click AI-generated project status with completion stats and recommended next steps

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

## AI Chat Panel

The AI assistant is available on the tasks page via the **AI** button in the top right. It is scoped to the current project and powered by RAG — answers are grounded in actual task content rather than general knowledge.

**How it works:**
- Every chat message embeds the query and retrieves the most semantically relevant task content chunks via Atlas Vector Search
- Retrieved chunks are injected into the LLM context alongside a full task overview (title, status, priority, due date for all tasks)
- Replies are rendered as markdown (bold, lists, code blocks, headings)
- Conversation history is maintained across turns so follow-up questions work naturally
- Clicking **Summarize this project** fires a dedicated summary endpoint with pre-computed stats (completion %, overdue count) and also enters the conversation history for follow-up

**RAG strategy toggle:**
A `chunked / single` toggle above the input lets you switch retrieval strategies:
- `chunked` (default) — splits content into 150-word overlapping chunks; best for pinpointing specific facts
- `single` — one embedding per full task; best for whole-task relevance
