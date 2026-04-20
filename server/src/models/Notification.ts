export interface INotification {
    id: number;
    profile_id: string;
    message: string;
    read_status: boolean;
    created_at: Date;
}
