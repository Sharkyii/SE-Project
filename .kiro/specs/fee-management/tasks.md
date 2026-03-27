# Implementation Plan: Fee Management

## Overview

Implement the Fee Management feature with minimal changes to the existing codebase. All new code is isolated in new files. The only modifications to existing files are: adding the fee route to `app.ts` and adding the `fee_receipts` table to `schema.sql`.

## Tasks

- [ ] 1. Add fee types and Zustand slice
  - [ ] 1.1 Create `client/src/types/fee.ts` with FeeType, Bank, PaymentMethod, VerificationStatus, FeeReceiptRecord, FeeUploadPayload, FeeUploadResponse, BANKS constant, and PAYMENT_METHODS constant
    - _Requirements: 1.1, 1.2, 1.5, 1.6_
  - [ ] 1.2 Create `client/src/app/feeSlice.ts` with FeeSectionState, FeeState interfaces and Zustand store (useFeeStore) with setFile, setBank, setPaymentMethod, setStatus, setError, setFileUrl actions
    - _Requirements: 3.5_
  - [ ]* 1.3 Write unit tests for feeSlice state transitions (setFile, setBank, setStatus, setError)
    - Test that each action correctly updates the corresponding fee type's state
    - _Requirements: 3.5_

- [ ] 2. Create fee API service and validation utilities
  - [ ] 2.1 Create `client/src/services/feeApi.ts` with `uploadFeeReceipt(payload: FeeUploadPayload)` function that posts multipart/form-data to `/api/student/fees/upload`
    - _Requirements: 1.7, 1.8_
  - [ ] 2.2 Create `client/src/utils/feeValidation.ts` with `validateFileType(file: File): string | null` and `validateFeeForm(file, bank, paymentMethod): string | null` functions
    - validateFileType: accept image/jpeg, image/png, application/pdf only
    - validateFeeForm: check all three fields are present
    - _Requirements: 1.2, 1.3, 5.4, 5.5, 5.6_
  - [ ]* 2.3 Write property test for validateFileType (Property 1)
    - Feature: fee-management, Property 1: file type validation rejects non-allowed types
    - Use fast-check to generate arbitrary MIME type strings; assert only jpeg/png/pdf pass
    - _Requirements: 1.2, 1.3_
  - [ ]* 2.4 Write property test for validateFeeForm (Property 2)
    - Feature: fee-management, Property 2: all required fields must be present before submission
    - Use fast-check to generate subsets of {file, bank, paymentMethod}; assert any missing field returns error
    - _Requirements: 5.4, 5.5, 5.6_

- [ ] 3. Build reusable fee UI components
  - [ ] 3.1 Create `client/src/components/fee/VerificationStatus.tsx` — renders status badge for idle/uploading/verifying/verified/error states with appropriate icons and colors
    - idle: "Not uploaded" (gray)
    - verifying/uploading: "Verifying..." with spinner (yellow)
    - verified: "Verified" with green checkmark (green)
    - error: "Upload failed" (red)
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ] 3.2 Create `client/src/components/fee/BankSelector.tsx` — renders clickable bank cards for SBI, HDFC, ICICI, Axis, Kotak with logo images and highlight on selection
    - _Requirements: 1.5_
  - [ ] 3.3 Create `client/src/components/fee/PaymentMethodSelector.tsx` — renders radio/button group for UPI, Net Banking, Debit Card, Credit Card
    - _Requirements: 1.6_
  - [ ]* 3.4 Write unit tests for VerificationStatus component (Property 4)
    - Feature: fee-management, Property 4: status display matches internal state
    - Test each status value renders the correct label and icon
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 3.5 Write unit test for BankSelector — assert all 5 banks render with logo img tags
    - _Requirements: 1.5_

- [ ] 4. Build FeeSection and FeeManagement page
  - [ ] 4.0 Create `client/src/components/fee/InstituteNotice.tsx` — static info panel showing:
    - Online payment link (clickable) to octopod.co.in
    - Bank of India transfer details (Account No, IFSC, Account Holder)
    - Reminder to include name, roll number, purpose in transaction remarks
    - Registration deadline: 31 Dec 2025 with printout requirement
    - Link to late registration policy
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 4.1 Create `client/src/components/fee/FeeSection.tsx` — upload card component that:
    - Reads state from useFeeStore for its feeType
    - Shows file input (accept=".jpg,.jpeg,.png,.pdf"), file name preview, BankSelector, PaymentMethodSelector
    - On submit: validates form, sets status to uploading, calls feeApi.uploadFeeReceipt, sets status to verifying (500ms delay), then sets to verified on success or error on failure
    - Disables submit button when status is uploading or verifying
    - Shows inline validation/error messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4, 2.5, 5.1, 5.2, 5.3_
  - [ ] 4.2 Create `client/src/pages/student/FeeManagement.tsx` — page that renders `InstituteNotice` at the top, then two FeeSection components (mess and academic) side by side or stacked
    - _Requirements: 1.1, 3.1, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 4.3 Write property test for FeeSection button disabled state (Property 5)
    - Feature: fee-management, Property 5: upload button disabled during verification
    - For uploading and verifying statuses, assert button has disabled attribute
    - _Requirements: 2.2_
  - [ ]* 4.4 Write property test for FeeSection button enabled on error (Property 6)
    - Feature: fee-management, Property 6: error state re-enables upload button
    - For error status, assert button does not have disabled attribute
    - _Requirements: 5.3_

- [ ] 5. Checkpoint — ensure frontend compiles and components render
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement backend fee controller and route
  - [ ] 6.1 Create `server/src/controllers/feeController.ts` with `uploadReceipt` handler:
    - Parse fee_type, bank, payment_method from req.body
    - Upload file buffer to Supabase Storage bucket `fee-receipts`
    - Insert record into fee_receipts table with status='verified'
    - Return { record, fileUrl, status: 'verified' }
    - Return 500 if storage upload fails
    - _Requirements: 1.7, 1.8, 2.3, 4.1, 4.2, 4.4_
  - [ ] 6.2 Create `server/src/routes/fee.routes.ts` with `POST /upload` route protected by `protect` and `authorize('student')` middleware, using multer for multipart parsing
    - _Requirements: 4.3_
  - [ ] 6.3 Add `fee_receipts` table definition to `server/schema.sql`
    - _Requirements: 4.1_
  - [ ] 6.4 Mount fee routes in `server/src/app.ts` by adding `app.use('/api/student/fees', feeRoutes)` — this is the only change to an existing file
    - _Requirements: 1.7_
  - [ ]* 6.5 Write unit test for uploadReceipt controller (Property 3 + Property 7)
    - Feature: fee-management, Property 3: verification always returns verified
    - Feature: fee-management, Property 7: stored record contains all required fields
    - Mock Supabase; assert response.status === 'verified' and all record fields are non-null
    - _Requirements: 2.3, 4.1, 4.2_
  - [ ]* 6.6 Write unit test for auth guard — assert 401 returned when token is missing
    - _Requirements: 4.3_

- [ ] 7. Wire FeeManagement page into the student router
  - [ ] 7.1 Add the `/fee-management` route to the student section of `client/src/App.tsx` pointing to FeeManagement page
    - This is a minimal addition — one new `<Route>` element only
    - _Requirements: 1.1_
  - [ ] 7.2 Add a "Fee Management" link to the student sidebar in `client/src/components/layout/Sidebar.tsx`
    - Minimal change — one new nav item only
    - _Requirements: 1.1_

- [ ] 8. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The only existing files modified are: `server/src/app.ts` (one line), `server/schema.sql` (new table), `client/src/App.tsx` (one route), `client/src/components/layout/Sidebar.tsx` (one nav item)
- All other new code lives in new files — no existing functionality is touched
- fast-check must be installed as a dev dependency before running property tests: `npm install --save-dev fast-check`
- Supabase Storage bucket `fee-receipts` must be created manually in the Supabase dashboard with public read access
