export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type DocType = 'aadhar_card' | 'college_id' | 'photo' | 'other';

export interface StudentDocument {
  id: number;
  application_id: number;
  doc_type: DocType;
  file_url: string;
  original_name: string;
  uploaded_at: string;
}

export interface EnrollmentApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  department: string;
  semester: number;
  section: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
  status: ApplicationStatus;
  remarks?: string;
  reviewed_at?: string;
  created_at: string;
  student_documents?: StudentDocument[];
}

export const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MBA', 'MCA'];

export const DOC_LABELS: Record<DocType, string> = {
  aadhar_card: 'Aadhar Card',
  college_id: 'College ID',
  photo: 'Passport Photo',
  other: 'Other Document',
};
