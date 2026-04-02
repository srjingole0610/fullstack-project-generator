# FullStack Project Generator

> Scaffold a production-ready React + Node.js app in seconds — directly from VS Code.

![Demo](images/demo.gif)

## ✨ Features

- 🚀 **One command** generates a complete full-stack project
- ⚛️ **React frontend** — Vite or Create React App
- 🟢 **Node.js backend** — Express + MongoDB + Mongoose
- 🔐 **Auth built-in** — JWT, Firebase, or Auth0
- 🛡️ **Security** — bcrypt, helmet, rate limiting, CORS
- 📦 **Auto install** — optionally runs npm install for you
- 🐳 **Docker ready** — docker-compose.yml included

## 🚀 Usage

1. Open Command Palette → `Ctrl+Shift+P`
2. Type: `Generate Full Stack App`
3. Follow the 5-step wizard
4. Your project is ready!

## 📁 Generated Structure
```
my-app/
├── client/          # React + TypeScript
│   ├── src/
│   │   ├── api/         # Axios + auth helpers
│   │   ├── components/  # Navbar, ProtectedRoute
│   │   ├── context/     # AuthContext
│   │   └── pages/       # Login, Register, Dashboard
├── server/          # Node + Express + TypeScript
│   ├── src/
│   │   ├── controllers/ # Auth, User
│   │   ├── middleware/  # JWT auth, validation, errors
│   │   ├── models/      # User (Mongoose)
│   │   └── routes/      # /api/auth, /api/users
├── .gitignore
├── docker-compose.yml
└── README.md
```

## ⚙️ Requirements

- Node.js ≥ 18
- MongoDB (local or Atlas)