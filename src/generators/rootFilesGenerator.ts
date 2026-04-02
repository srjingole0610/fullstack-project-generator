import { ProjectConfig } from '../types';
import { writeFile, joinPath } from '../utils/fileUtils';

/**
 * Generates files that live at the project root:
 *  - README.md
 *  - .gitignore
 *  - docker-compose.yml (optional dev helper)
 */
export function generateRootFiles(config: ProjectConfig, root: string): void {
  writeFile(joinPath(root, 'README.md'),           readme(config));
  writeFile(joinPath(root, '.gitignore'),           gitignore());
  writeFile(joinPath(root, 'docker-compose.yml'),  dockerCompose(config));
}

// ─── README ───────────────────────────────────────────────────────────────────

function readme(config: ProjectConfig): string {
  const authLabel: Record<string, string> = {
    jwt: 'JWT (JSON Web Tokens)',
    firebase: 'Firebase Authentication',
    auth0: 'Auth0',
  };

  return `# ${config.projectName}

A production-ready full-stack web application.

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React + ${config.frontendFramework === 'vite' ? 'Vite' : 'Create React App'} + TypeScript |
| Backend   | Node.js + Express + TypeScript              |
| Database  | MongoDB (Mongoose)                          |
| Auth      | ${authLabel[config.authType]}               |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Clone & install

\`\`\`bash
# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install
\`\`\`

### 2. Configure environment variables

\`\`\`bash
# Backend
cp server/.env.example server/.env
# Edit server/.env — set MONGODB_URI and JWT_SECRET

# Frontend
cp client/.env.example client/.env
# Edit client/.env if needed
\`\`\`

### 3. Run in development

\`\`\`bash
# Terminal 1 — backend (port 5000)
cd server && npm run dev

# Terminal 2 — frontend (port 3000)
cd client && npm run dev
\`\`\`

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

\`\`\`
${config.projectName}/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios instance + API helpers
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── pages/           # Login, Register, Dashboard
│   │   └── types/           # TypeScript interfaces
│   └── vite.config.ts
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # DB connection, env validation
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/      # auth, error handler, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   └── utils/           # JWT, crypto helpers
│   └── tsconfig.json
│
├── docker-compose.yml       # Dev MongoDB + app containers
└── README.md
\`\`\`

---

## 🔐 API Reference

### Auth endpoints

| Method | Path                 | Auth required | Description            |
|--------|----------------------|---------------|------------------------|
| POST   | /api/auth/register   | No            | Create a new account   |
| POST   | /api/auth/login      | No            | Sign in & get JWT      |
| GET    | /api/auth/me         | ✅ Yes        | Get current user       |

### User endpoints

| Method | Path               | Auth required | Description       |
|--------|--------------------|---------------|-------------------|
| GET    | /api/users         | ✅ Yes        | List all users    |
| GET    | /api/users/:id     | ✅ Yes        | Get user by ID    |

---

## 🏗️ Production Build

\`\`\`bash
# Build frontend
cd client && npm run build   # outputs to client/dist

# Build backend
cd server && npm run build   # outputs to server/dist
cd server && npm start        # run compiled JS
\`\`\`

---

## 🐳 Docker (optional)

\`\`\`bash
docker-compose up -d
\`\`\`

---

## 📝 License

MIT
`;
}

// ─── .gitignore ───────────────────────────────────────────────────────────────

function gitignore(): string {
  return `# ── Dependencies ──────────────────────────────
node_modules/
.pnp
.pnp.js

# ── Builds ────────────────────────────────────
dist/
build/
out/

# ── Environment variables ──────────────────────
.env
.env.local
.env.*.local

# ── Logs ──────────────────────────────────────
logs/
*.log
npm-debug.log*

# ── OS / Editor ───────────────────────────────
.DS_Store
Thumbs.db
.idea/
.vscode/settings.json

# ── TypeScript ────────────────────────────────
*.tsbuildinfo

# ── Testing ───────────────────────────────────
coverage/
`;
}

// ─── docker-compose.yml ───────────────────────────────────────────────────────

function dockerCompose(config: ProjectConfig): string {
  return `version: '3.9'

services:
  # MongoDB instance for local development
  mongo:
    image: mongo:7
    container_name: ${config.projectName}-mongo
    restart: unless-stopped
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: ${config.projectName}

  # Backend API server
  server:
    build: ./server
    container_name: ${config.projectName}-server
    restart: unless-stopped
    ports:
      - '5000:5000'
    env_file: ./server/.env
    environment:
      MONGODB_URI: mongodb://mongo:27017/${config.projectName}
    depends_on:
      - mongo

  # Frontend dev server (for production, serve the built static files instead)
  client:
    build: ./client
    container_name: ${config.projectName}-client
    restart: unless-stopped
    ports:
      - '3000:3000'
    depends_on:
      - server

volumes:
  mongo-data:
`;
}
