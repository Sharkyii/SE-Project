export interface User {
    id: number;
    email: string;
    role: 'admin' | 'faculty' | 'student';
    name: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}
