# Design Document: Fee Management

## Overview

The Fee Management feature enables students to upload Mess fee and Academic fee receipts (JPEG, PNG, or PDF) along with payment metadata (bank and payment method). After upload, the system simulates a verification flow with animated UI feedback, then always marks the receipt as verified. The feature integrates into the existing React/TypeScript + Vite + Tailwind + Zustand frontend and the Node.js/Express + Supabase backend.

---

## Architecture

```mermaid
flowchart TD
    A[Student Browser] -->|multipart/form-data POST| B[Express /api/student/fees/upload]
    B --> C[auth middleware: protect + authorize student]
    C --> D[feeController.uploadReceipt]
    D --> E[Supabase Storage: fee-receipts bucket]
    D --> F[Supabase DB: fee_receipts table]
    E -->|public file URL| D
    F -->|inserted record| D
    D -->|{ status: verified, fileUrl, record }| A
    A --> G[Fee_Store Zustand slice]
    G --> H[FeeManagement page re-render]
```

The frontend drives the UX state machine (idle → uploading → verifying → verified / error). The backend is stateless per request: it uploads the file to Supabase Storage, inserts a record with `status = 'verified'`, and returns the result. No async job queue is needed since verification is simulated synchronously.

---

## Components and Interfaces

### Frontend Components

```
client/src/
  pages/student/
    FeeManagement.tsx          # Main page — two fee sections
  components/fee/
    FeeSection.tsx             # Reusable upload card per fee type
    BankSelector.tsx           # Bank picker with logos
    PaymentMethodSelector.tsx  # UPI / Net Banking / Debit / Credit
    VerificationStatus.tsx     # Status badge (Not uploaded / Verifying / Verified)
  app/
    feeSlice.ts                # Zustand slice for fee state
  services/
    feeApi.ts                  # Axios calls for fee endpoints
  types/
    fee.ts                     # Fee-specific TypeScript types
```

### FeeSection Props Interface

```typescript
interface FeeSectionProps {
  feeType: 'mess' | 'academic';
  title: string;
}
```

### BankSelector Props Interface

```typescript
interface BankSelectorProps {
  value: string;
  onChange: (bank: string) => void;
  disabled?: boolean;
}
```

### Backend Modules

```
server/src/
  controllers/
    feeController.ts           # uploadReceipt handler
  routes/
    fee.routes.ts              # POST /api/student/fees/upload
```

The fee route is mounted under `/api/student/fees` and protected by the existing `protect` + `authorize('student')` middleware chain.

---

## Data Models

### Supabase Table: `fee_receipts`

```sql
CREATE TABLE IF NOT EXISTS fee_receipts (
    id            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id    TEXT NOT NULL,
    fee_type      TEXT NOT NULL CHECK (fee_type IN ('mess', 'academic')),
    bank          TEXT NOT NULL CHECK (bank IN ('SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Net Banking', 'Debit Card', 'Credit Card')),
    file_url      TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verifying', 'verified')),
    uploaded_at   TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
```

### TypeScript Types (`client/src/types/fee.ts`)

```typescript
export type FeeType = 'mess' | 'academic';
export type Bank = 'SBI' | 'HDFC' | 'ICICI' | 'Axis' | 'Kotak';
export type PaymentMethod = 'UPI' | 'Net Banking' | 'Debit Card' | 'Credit Card';
export type VerificationStatus = 'idle' | 'uploading' | 'verifying' | 'verified' | 'error';

export interface FeeReceiptRecord {
  id: number;
  student_id: string;
  fee_type: FeeType;
  bank: Bank;
  payment_method: PaymentMethod;
  file_url: string;
  status: 'verified';
  uploaded_at: string;
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
  status: 'verified';
}
```

### Zustand Fee Slice (`client/src/app/feeSlice.ts`)

```typescript
export interface FeeSectionState {
  verificationStatus: VerificationStatus;
  selectedFile: File | null;
  selectedBank: Bank | '';
  selectedPaymentMethod: PaymentMethod | '';
  fileUrl: string | null;
  errorMessage: string | null;
}

export interface FeeState {
  mess: FeeSectionState;
  academic: FeeSectionState;
  setFile: (feeType: FeeType, file: File | null) => void;
  setBank: (feeType: FeeType, bank: Bank | '') => void;
  setPaymentMethod: (feeType: FeeType, method: PaymentMethod | '') => void;
  setStatus: (feeType: FeeType, status: VerificationStatus) => void;
  setError: (feeType: FeeType, message: string | null) => void;
  setFileUrl: (feeType: FeeType, url: string) => void;
}
```

### Bank Metadata (static, frontend)

```typescript
export const BANKS = [
  { id: 'SBI',   label: 'SBI',   logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
  { id: 'HDFC',  label: 'HDFC',  logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg' },
  { id: 'ICICI', label: 'ICICI', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg' },
  { id: 'Axis',  label: 'Axis',  logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg' },
  { id: 'Kotak', label: 'Kotak', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Kotak_Mahindra_Bank_logo.svg' },
] as const;

export const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Net Banking', 'Debit Card', 'Credit Card'];
```

---

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: File type validation rejects non-allowed types

*For any* file whose MIME type is not `image/jpeg`, `image/png`, or `application/pdf`, the client-side validator SHALL return an error and the upload SHALL NOT be triggered.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: All required fields must be present before submission

*For any* combination of missing fields (no file, no bank, no payment method), the form validator SHALL return a non-empty error message and SHALL NOT make a network request.

**Validates: Requirements 5.4, 5.5, 5.6**

---

### Property 3: Verification always succeeds (hardcoded)

*For any* valid upload request reaching the Upload_Service, the returned `status` field SHALL always equal `'verified'`.

**Validates: Requirements 2.3, 4.2**

---

### Property 4: Status display matches internal state

*For any* VerificationStatus value in the Fee_Store, the rendered VerificationStatus component SHALL display the correct label and icon corresponding to that state.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

### Property 5: Upload button disabled during verification

*For any* FeeSection where verificationStatus is `'uploading'` or `'verifying'`, the submit button SHALL have the `disabled` attribute set to true.

**Validates: Requirements 2.2**

---

### Property 6: Error state re-enables upload button

*For any* FeeSection where verificationStatus is `'error'`, the submit button SHALL NOT have the `disabled` attribute.

**Validates: Requirements 5.3**

---

### Property 7: Stored record contains all required fields

*For any* successful upload, the record inserted into `fee_receipts` SHALL contain non-null values for `student_id`, `fee_type`, `bank`, `payment_method`, `file_url`, `status`, and `uploaded_at`.

**Validates: Requirements 4.1**

---

## Error Handling

| Scenario | Frontend Behavior | Backend Behavior |
|---|---|---|
| Invalid file type selected | Show inline error, no request sent | N/A |
| No file selected on submit | Show "Please select a file to upload." | N/A |
| No bank selected on submit | Show "Please select your bank." | N/A |
| No payment method on submit | Show "Please select a payment method." | N/A |
| Network error during upload | Show "Upload failed. Please try again.", re-enable button | N/A |
| Supabase Storage failure | Show API error message, re-enable button | Return 500 with descriptive message |
| Missing/invalid JWT | N/A | Return 401 Unauthorized |

---

## Testing Strategy

### Unit Tests

Unit tests cover specific examples, edge cases, and validation logic:

- `validateFileType()` — test with JPEG, PNG, PDF (pass), and TXT, MP4, DOCX (fail)
- `validateForm()` — test all combinations of missing fields
- `VerificationStatus` component — snapshot/render tests for each status value
- `BankSelector` component — renders all 5 banks with logos
- `feeSlice` — state transitions: setFile, setBank, setStatus, setError

### Property-Based Tests

Property-based tests use **fast-check** (already compatible with Vite/Vitest) to validate universal properties across generated inputs.

Each property test runs a minimum of **100 iterations**.

Tag format: `Feature: fee-management, Property {N}: {property_text}`

| Property | Test Description | Library |
|---|---|---|
| Property 1 | Generate arbitrary file MIME types; assert validator rejects all non-allowed types | fast-check |
| Property 2 | Generate all subsets of {file, bank, paymentMethod}; assert missing any field triggers error | fast-check |
| Property 3 | Generate valid upload payloads; assert response.status === 'verified' always | fast-check |
| Property 4 | Generate VerificationStatus values; assert rendered output matches expected label/icon | fast-check |
| Property 5 | Generate FeeSection states with uploading/verifying status; assert button is disabled | fast-check |
| Property 6 | Generate FeeSection states with error status; assert button is enabled | fast-check |
| Property 7 | Generate valid upload payloads; assert all DB record fields are non-null | fast-check |

### Dual Testing Approach

Unit tests catch concrete bugs in specific scenarios. Property tests verify general correctness across the full input space. Both are required for comprehensive coverage.
