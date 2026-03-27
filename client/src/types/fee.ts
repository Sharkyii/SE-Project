export type FeeType = 'mess' | 'academic';
export type Bank = 'SBI' | 'HDFC' | 'ICICI' | 'Axis' | 'Kotak' | 'Bank of India';
export type PaymentMethod = 'UPI' | 'Net Banking' | 'Debit Card' | 'Credit Card';
export type VerificationStatus = 'idle' | 'uploading' | 'verifying' | 'pending' | 'approved' | 'rejected' | 'error';
export type DbReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface FeeReceiptRecord {
  id: number;
  student_id: string;
  fee_type: FeeType;
  bank: Bank;
  payment_method: PaymentMethod;
  file_url: string;
  status: DbReceiptStatus;
  uploaded_at: string;
  student_name?: string;
}

export interface FeeUploadPayload {
  feeType: FeeType;
  bank: Bank;
  paymentMethod: PaymentMethod;
  file: File;
}

export interface FeeUploadResponse {
  record: FeeReceiptRecord;
  fileUrl: string;
  status: DbReceiptStatus;
}

export const BANKS: { id: Bank; label: string; logo: string }[] = [
  { id: 'SBI', label: 'SBI', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
  { id: 'HDFC', label: 'HDFC', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg' },
  { id: 'ICICI', label: 'ICICI', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg' },
  { id: 'Axis', label: 'Axis', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg' },
  { id: 'Kotak', label: 'Kotak', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Kotak_Mahindra_Bank_logo.svg' },
  { id: 'Bank of India', label: 'Bank of India', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Bank_of_India_logo.svg' },
];

export const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Net Banking', 'Debit Card', 'Credit Card'];
