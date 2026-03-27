import type { Bank, PaymentMethod } from '../types/fee';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const validateFileType = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, or PDF files are accepted.';
  }
  return null;
};

export const validateFeeForm = (
  file: File | null,
  bank: Bank | '',
  paymentMethod: PaymentMethod | ''
): string | null => {
  if (!file) return 'Please select a file to upload.';
  if (!bank) return 'Please select your bank.';
  if (!paymentMethod) return 'Please select a payment method.';
  return validateFileType(file);
};
