# Fullstack Node — Backend

A RESTful Express.js backend for a collaborative project & task management system. Users can create projects, manage team members with role-based access control, and create/track tasks with priority, status, and due dates.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Runtime    | Node.js                                 |
| Framework  | Express.js v4.21                        |
| Database   | MongoDB + Mongoose v8.8                 |
| Auth       | JWT (Bearer token)                      |
| Validation | express-validator                       |
| Password   | bcrypt                                  |
| Logging    | Winston + Morgan + express-winston      |
| API Docs   | Swagger (swagger-jsdoc + swagger-ui-express) |
| Config     | dotenv (per-environment files)          |

## Getting Started

### Prerequisites

- Node.js
- A MongoDB Atlas account (free tier is enough) — [Sign up here](https://www.mongodb.com/atlas)

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
   Then open `.env.development` and fill in your own values:
   - `DATABASE_URL` — your MongoDB Atlas connection string
   - `DATABASE_NAME` — name for your database (e.g. `fullstackTasks`)
   - `JWT_SECRET` — any long random string

4. Seed the database with demo data
   ```bash
   npm run seed
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## Demo Accounts

After seeding, you can log in with any of these accounts (all use password `Password123#`):

| Name    | Email                 | Role in Project A |
|---------|-----------------------|-------------------|
| Alice   | alice@example.com     | Manager           |
| Bob     | bob@example.com       | Editor            |
| Charlie | charlie@example.com   | Viewer            |

## API Documentation

Swagger UI is available at:
```
http://localhost:3001/api-docs
```

## Project Structure

```
src/
├── users/
├── projects/
├── projectMembers/
├── tasks/
├── taskContents/
└── settings/
scripts/
└── seed.js
```

## Role-Based Access

| Role    | View | Edit | Manage Members |
|---------|------|------|----------------|
| Manager | ✅   | ✅   | ✅             |
| Editor  | ✅   | ✅   | ❌             |
| Viewer  | ✅   | ❌   | ❌             |
