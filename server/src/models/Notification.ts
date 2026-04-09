export interface INotification {
    id: number;
    student_id: string;
    message: string;
    read_status: boolean;
    created_at: Date;
}
