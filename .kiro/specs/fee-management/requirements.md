# Requirements Document

## Introduction

The Fee Management feature allows students to upload Mess fee and Academic fee receipts (image or PDF files) through the Course Management system. After uploading, the system simulates a verification process with animated feedback, then marks the receipt as verified and displays a success message. The feature integrates with the existing React/TypeScript frontend (Vite, Tailwind CSS, Zustand) and Node.js/Express backend using Supabase for storage.

### Institute Fee Payment Context (ABV IIITM Gwalior)

This feature is built for ABV IIITM Gwalior's Even Semester (A.Y. 2025-26) fee registration. The following real payment details must be displayed on the Fee Management page:

**Online Payment Link:** https://octopod.co.in/student/admission/08d02b1d9ee5fa9d0be8bb55f8c5dd3c

**Bank Transfer Details (for both Academic Fee and Mess/Hostel Fee):**
- Bank Name: Bank of India
- Account Number: 945210110000969
- IFSC Code: BKID0009462
- Account Holder Name: Director, ABV IIITM GWALIOR

**Registration Deadline:** 31 December 2025 (in-person registration)

**Important Notes:**
- Students must mention their name, roll number, and purpose of payment in transaction remarks
- Physical printout of both Academic and Mess fee receipts must be brought on registration day
- Institute Identity Card is mandatory during registration
- No impersonation is permissible
- Late registration policy: https://iiitm.ac.in/index.php/en/academics-final/policy-for-late-registration

## Glossary

- **Fee_Receipt**: A file (image or PDF) uploaded by a student as proof of fee payment.
- **Fee_Type**: The category of fee — either "mess" (Mess Fee) or "academic" (Academic Fee).
- **Payment_Method**: The mode used to make the payment — one of "UPI", "Net Banking", "Debit Card", or "Credit Card".
- **Bank**: The financial institution through which the payment was made (e.g., SBI, HDFC, ICICI, Axis, Kotak).
- **Verification_Status**: The current state of a fee receipt — one of `pending`, `verifying`, or `verified`.
- **Upload_Service**: The backend API endpoint responsible for receiving and storing fee receipts.
- **Fee_Store**: The frontend Zustand state slice managing fee receipt state.
- **Student**: An authenticated user with the role `student`.
- **Verification_Simulator**: The backend logic that simulates receipt verification and always returns a verified result.

---

## Requirements

### Requirement 1: Fee Receipt Upload

**User Story:** As a student, I want to upload my Mess fee and Academic fee receipts along with payment details, so that I can submit complete proof of payment to the institution.

#### Acceptance Criteria

1. THE Fee_Management_Page SHALL display two distinct upload sections — one for Mess Fee and one for Academic Fee.
2. WHEN a student selects a file for upload, THE Fee_Management_Page SHALL accept only files of type JPEG, PNG, or PDF.
3. IF a student attempts to upload a file that is not JPEG, PNG, or PDF, THEN THE Fee_Management_Page SHALL display an error message indicating the accepted file types.
4. WHEN a student selects a valid file, THE Fee_Management_Page SHALL display the selected file name before submission.
5. THE Fee_Management_Page SHALL display a bank selection field with the following options: SBI, HDFC, ICICI, Axis, and Kotak, each accompanied by the bank's logo.
6. THE Fee_Management_Page SHALL display a payment method selection field with the following options: UPI, Net Banking, Debit Card, and Credit Card.
7. THE Upload_Service SHALL accept multipart/form-data requests containing the receipt file, fee_type, bank, and payment_method fields.
8. WHEN a valid file is submitted, THE Upload_Service SHALL store the file in Supabase Storage and return the public URL and a generated receipt record.

---

### Requirement 2: Verification Flow

**User Story:** As a student, I want to see a verification animation after uploading my receipt, so that I know the system is processing my submission.

#### Acceptance Criteria

1. WHEN a student submits a valid receipt file, THE Fee_Management_Page SHALL immediately display a "Verifying..." status with a loading animation.
2. WHILE the verification simulation is in progress, THE Fee_Management_Page SHALL disable the upload button to prevent duplicate submissions.
3. WHEN the Verification_Simulator completes, THE Upload_Service SHALL always return a `verified` status (hardcoded success).
4. WHEN the verified response is received, THE Fee_Management_Page SHALL display a "Verification successful" success message.
5. WHEN the verified response is received, THE Fee_Management_Page SHALL update the displayed Verification_Status to "Verified".

---

### Requirement 3: Fee Receipt Status Display

**User Story:** As a student, I want to view the current status of my uploaded fee receipts, so that I can confirm my payments have been recorded.

#### Acceptance Criteria

1. THE Fee_Management_Page SHALL display the Verification_Status for each Fee_Type (Mess Fee and Academic Fee).
2. WHEN a receipt has not yet been uploaded for a Fee_Type, THE Fee_Management_Page SHALL display a "Not uploaded" status for that Fee_Type.
3. WHEN a receipt is in the `verifying` state, THE Fee_Management_Page SHALL display a "Verifying..." label with a spinner.
4. WHEN a receipt is in the `verified` state, THE Fee_Management_Page SHALL display a "Verified" label with a green checkmark icon.
5. THE Fee_Store SHALL persist the Verification_Status for each Fee_Type across page navigations within the same session.

---

### Requirement 4: Backend Receipt Storage

**User Story:** As a system, I want to persist fee receipt records in the database, so that submission history is maintained.

#### Acceptance Criteria

1. THE Upload_Service SHALL store a fee receipt record in the `fee_receipts` Supabase table containing: `student_id`, `fee_type`, `bank`, `payment_method`, `file_url`, `status`, and `uploaded_at`.
2. WHEN a receipt record is created, THE Upload_Service SHALL set the initial `status` to `verified` (simulated verification always succeeds).
3. THE Upload_Service SHALL require a valid authenticated student JWT token; IF the token is missing or invalid, THEN THE Upload_Service SHALL return a 401 Unauthorized response.
4. IF the Supabase Storage upload fails, THEN THE Upload_Service SHALL return a 500 error response with a descriptive message.
5. WHEN a student uploads a receipt for a Fee_Type they have already uploaded, THE Upload_Service SHALL create a new record rather than overwriting the existing one.

---

### Requirement 5: Institute Payment Information Display

**User Story:** As a student, I want to see the official payment link and bank details on the fee page, so that I know exactly how and where to pay before uploading my receipt.

#### Acceptance Criteria

1. THE Fee_Management_Page SHALL display a prominent notice section at the top with the official online payment link: `https://octopod.co.in/student/admission/08d02b1d9ee5fa9d0be8bb55f8c5dd3c`.
2. THE Fee_Management_Page SHALL display the Bank of India bank transfer details: Account Number `945210110000969`, IFSC Code `BKID0009462`, Account Holder `Director, ABV IIITM GWALIOR`.
3. THE Fee_Management_Page SHALL display a reminder that students must mention their name, roll number, and purpose of payment in transaction remarks.
4. THE Fee_Management_Page SHALL display the registration deadline of 31 December 2025 and the requirement to bring physical printouts on that date.
5. THE Fee_Management_Page SHALL display a link to the late registration policy: `https://iiitm.ac.in/index.php/en/academics-final/policy-for-late-registration`.

---

### Requirement 6: Error Handling

**User Story:** As a student, I want to see clear error messages when something goes wrong, so that I understand what action to take.

#### Acceptance Criteria

1. IF the Upload_Service returns an error response, THEN THE Fee_Management_Page SHALL display a human-readable error message to the student.
2. IF a network error occurs during upload, THEN THE Fee_Management_Page SHALL display a "Upload failed. Please try again." message.
3. WHEN an error is displayed, THE Fee_Management_Page SHALL re-enable the upload button so the student can retry.
4. IF a student submits without selecting a file, THEN THE Fee_Management_Page SHALL display a "Please select a file to upload." validation message without making a network request.
5. IF a student submits without selecting a bank, THEN THE Fee_Management_Page SHALL display a "Please select your bank." validation message without making a network request.
6. IF a student submits without selecting a payment method, THEN THE Fee_Management_Page SHALL display a "Please select a payment method." validation message without making a network request.
