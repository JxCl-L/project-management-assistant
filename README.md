# Fullstack React — Frontend

A full-stack collaborative project & task management app. Users can create projects, manage team members with role-based access (manager/editor/viewer), and create/track tasks with priority, status, due dates, and rich text descriptions.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | React 19 + Vite                     |
| Routing      | React Router v7                     |
| Server State | TanStack React Query v5             |
| Client State | React Context API                   |
| Forms        | React Hook Form + Zod validation    |
| UI           | Radix UI + Tailwind CSS (shadcn/ui) |
| HTTP         | Axios with interceptors             |
| Auth         | JWT stored in cookies               |

## Getting Started

### Prerequisites

- Node.js
- The backend server running locally — [Backend repo](https://github.com/JxCl-L/fullstack-node)

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
   Make sure the API base URL points to your local backend (default: `http://localhost:3001`)

4. Start the development server
   ```bash
   npm run dev
   ```

The app will run on `http://localhost:5173`

## Demo Accounts

Make sure you have seeded the backend database first. Then log in with:

| Name    | Email                 | Password     |
|---------|-----------------------|--------------|
| Alice   | alice@example.com     | Password123# |
| Bob     | bob@example.com       | Password123# |
| Charlie | charlie@example.com   | Password123# |

## Features

- **Authentication** — register, login, logout with JWT
- **Projects** — create and manage projects
- **Role-based access** — manager / editor / viewer permissions
- **Tasks** — create tasks with title, description, priority, status, and due date
- **Rich text editor** — task content powered by Tiptap
- **Real-time UI updates** — optimistic updates with React Query
