# ⚙️ Backend Developer Guide (`/server`)

The backend is built with **Node.js**, **Express**, and **TypeScript**, using **Supabase** for data persistence and authentication.

## 🚀 Quick Start
1. `npm install`
2. Configure `.env` (use `.env.example` as a template).
3. `npm run dev` - Starts server on [http://localhost:5000](http://localhost:5000).

## 📂 Backend Architecture

```text
src/
├── config/         # Supabase client & environment initialization
├── controllers/    # Business logic (Processes requests & queries DB)
├── middlewares/    # Auth protection & error handling
├── models/         # TypeScript interfaces (Database Schema)
├── routes/         # API endpoint definitions
└── server.ts       # Entry point
```

## 🔐 Authentication & Security
We use **JWT** stored in **HTTP-Only Cookies** for secure sessions.

### Using the Auth Middleware
To protect a route, import and use the `protect` middleware:
```typescript
import { protect } from '../middlewares/auth';
router.get('/profile', protect, getProfile);
```

## 🗄️ Database Operations (Supabase)
We use the official **Supabase SDK**. No traditional ORM is used to keep queries thin and fast.

### Query Pattern
Always import the `supabase` client from `config/db.ts`.
```typescript
import { supabase } from '../config/db';

const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('id', studentId);
```

## 📝 SQL Schema Management
The database schema is managed in Supabase. For local reference or manual setup, check the SQL comments in `src/config/db.ts`.

## 🛠️ Feature Contribution Workflow
1. **Model**: Define your data interface in `src/models/[Feature].ts`.
2. **Controller**: Implement the logic in `src/controllers/[feature]Controller.ts`.
3. **Route**: Register the endpoint in `src/routes/[feature]Routes.ts`.
4. **App Integration**: Import the router in `src/server.ts`.
