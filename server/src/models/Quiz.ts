export interface IQuiz {
    id: number;
    course_id: string;
    faculty_id: string;
    title: string;
    description: string;
    due_date: Date;
    created_at: Date;
}
