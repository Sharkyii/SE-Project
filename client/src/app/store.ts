import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../types';

interface AppState extends AuthState {
    // Add more slices here if needed
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'academic-erp-storage',
        }
    )
);
