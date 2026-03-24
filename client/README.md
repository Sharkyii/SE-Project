# 💻 Frontend Developer Guide (`/client`)

The frontend is built with **React 19**, **Vite**, and **Tailwind CSS v4** for a high-performance, modern user experience.

## 🚀 Quick Start
1. `npm install`
2. `npm run dev` - Starts development server on [http://localhost:5173](http://localhost:5173).

## 📂 Frontend Structure

```text
src/
├── app/            # Global State (Zustand)
├── components/     # UI Components
│   ├── layout/     # Core structure (Sidebar, Navbar)
│   └── shared/     # Reusable UI elements (Buttons, Inputs)
├── pages/          # Full page components
├── services/       # API calling logic (Axios instance)
├── types/          # Shared TypeScript interfaces
└── App.tsx         # Routing & Main Entry
```

## 🎨 Styling: Tailwind CSS v4
We use the latest Tailwind version. Configuration is handled in `src/index.css`.
- **Naming**: Use camelCase for props and PascalCase for components.
- **Micro-animations**: Use Tailwind's transition utilities for hover effects.

## 🧠 State Management (Zustand)
We use Zustand for lightweight, boilerplate-free state.
- **Auth Store**: Manages login state and user details.
- **Usage**:
```typescript
import { useStore } from './app/store';

const { user, login } = useStore();
```

## 🛠️ Adding a New Feature
1. **Types**: Add your data interfaces to `src/types/`.
2. **Components**: Build your UI in a new directory under `src/components/`.
3. **API**: Add necessary API calls to `src/services/api.ts`.
4. **Routing**: Add your new page/component to the routes in `src/App.tsx`.
5. **Navigation**: If needed, add an entry to the `Sidebar.tsx`.

## 🛡️ Best Practices
- Use **Lucide React** for icons.
- Ensure all components are responsive (mobile-first approach).
- Strictly follow the TypeScript interfaces to avoid runtime errors.
