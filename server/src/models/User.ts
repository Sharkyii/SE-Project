export interface IUser {
    id: number;
    email: string;
    password: string;
    role: 'admin' | 'faculty' | 'student';
    created_at: Date;
}