export interface IGrades {
    id: number;
    student_id: string;
    course_id: string;
    exam_type: 'mid' | 'final' | 'quiz' | 'assignment';
    score: number;
    created_at: Date;
}
