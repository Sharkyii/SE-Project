export interface IFeedback {
    id: number;
    student_id: string;
    email_id: string;
    course_id: string;
    semester: number;
    rating: number;
    comments?: string;
    created_at: Date;
}
