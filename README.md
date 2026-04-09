# 🎓 Academic ERP System (Supabase Edition)
hi
[![Tech Stack](https://img.shields.io/badge/Stack-React_|_Node_|_PostgreSQL-blue.svg)](# project-architecture)
[![Team](https://img.shields.io/badge/Team-SE_Project_BMS-green.svg)](#-team-assignments--roadmap)

## 🎯 Project Overview
The **Academic ERP System** is a comprehensive solution for managing educational institutions. Migrated from NoSQL to **PostgreSQL** via **Supabase**, this project ensures high data integrity, type safety, and real-time capabilities.

### Key Objectives
- **Centralized Data**: Single source of truth for students, faculty, and administration.
- **Relational Integrity**: Leveraging PostgreSQL for complex academic relationships.
- **Role-Based Access**: Specialized dashboards for Students, Faculty, and Admins.
- **Scalability**: Clean modular architecture to support future expansions.

---

## 🏗️ Project Architecture

This monorepo is structured for maximum developer efficiency:

| Component | Technology Stack | Key Modules |
| :--- | :--- | :--- |
| **[Client](./client)** | React 19, Vite, Tailwind v4, Zustand | Auth, Dashboards, UI Components |
| **[Server](./server)** | Node.js, Express, TS, Supabase | API, Auth Middleware, DB Logic |

---

## 🛠️ Global Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- NPM or PNPM
- A Supabase Project

### 2. Environment Configuration
Create a `.env` file in the `/server` directory:
```bash
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

### 3. Installation & Run
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

---

## 🤝 Team Assignments & Roadmap

The current construction phase is divided into the following modules. Please refer to your assigned issue on GitHub for specific requirements.

| # | Module | Developer | Status |
| :-- | :--- | :--- | :--- |
| 1 | Course Management | **LakshyaMulchandani** | 🛫 Open |
| 2 | Resource Allocation | **prathamjaiswal27** | 🛫 Open |
| 3 | Enrollment | **g0vind-S** | 🛫 Open |
| 4 | Oversight | **LakshyaMulchandani** | 🛫 Open |
| 5 | Attendance | **prathamjaiswal27** | 🛫 Open |
| 6 | Academic Management | **LakshyaMulchandani** | 🛫 Open |
| 7 | Leave Management | **Sharkyii** | 🛫 Open |
| 8 | Student Interaction | **saminali01** | 🛫 Open |
| 9 | Document Upload | **g0vind-S** | 🛫 Open |
| 10 | Fee Management | **Sharkyii** | 🛫 Open |
| 11 | Course Selection | **Sharkyii** | 🛫 Open |
| 12 | Viewers (Audits) | **saminali01** | 🛫 Open |
| 13 | Progress Tracking | **prathamjaiswal27** | 🛫 Open |
| 14 | Feedback System | **Sharkyii** | 🛫 Open |
| 15 | Gamification | **Sharkyii** | 🛫 Open |

---

## 📜 Development Standards

### Git Workflow 🌿
1. **Branching**: `feature/your-module-name` (e.g., `feature/attendance`)
2. **Commits**: Use descriptive messages (`feat: add attendance model`)
3. **Pull Requests**: Always request a review before merging to `main`.

### Coding Guidelines 💻
- **TypeScript**: Define interfaces in `models/` (server) or `types/` (client).
- **Styling**: Use Tailwind CSS utility classes. Avoid inline styles.
- **Safety**: Use the `protect` middleware for all authenticated routes.

---

## 📂 Project Structure Explained

```text
academic-erp/
├── client/              # React Frontend
│   ├── src/app/        # State Management (Zustand)
│   ├── src/components/ # Reusable UI Components
│   └── src/services/   # API logic (Axios)
├── server/              # Express Backend
│   ├── src/config/     # Supabase & Env Setup
│   ├── src/controllers/# Business Logic (Handy Tip: Keep logic here!)
│   └── src/routes/     # Clean API definitions
└── README.md           # You are here
```

---

## 🌟 Acknowledgments
Built with ❤️ by the **SE Project BMS** team. For any blockers, please reach out via the GitHub Issues board.
