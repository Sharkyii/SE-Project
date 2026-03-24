export interface IAttendance {
    id: number;
    student_id: string;
    course_id: string;
    date: Date;
    status: 'present' | 'absent';
    created_at: Date;
}
