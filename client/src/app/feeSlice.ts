import { create } from 'zustand';
import type { FeeType, Bank, PaymentMethod, VerificationStatus } from '../types/fee';

export interface FeeSectionState {
  verificationStatus: VerificationStatus;
  selectedFile: File | null;
  selectedBank: Bank | '';
  selectedPaymentMethod: PaymentMethod | '';
  fileUrl: string | null;
  errorMessage: string | null;
}

const defaultSection = (): FeeSectionState => ({
  verificationStatus: 'idle',
  selectedFile: null,
  selectedBank: '',
  selectedPaymentMethod: '',
  fileUrl: null,
  errorMessage: null,
});

interface FeeState {
  mess: FeeSectionState;
  academic: FeeSectionState;
  setFile: (feeType: FeeType, file: File | null) => void;
  setBank: (feeType: FeeType, bank: Bank | '') => void;
  setPaymentMethod: (feeType: FeeType, method: PaymentMethod | '') => void;
  setStatus: (feeType: FeeType, status: VerificationStatus) => void;
  setError: (feeType: FeeType, message: string | null) => void;
  setFileUrl: (feeType: FeeType, url: string) => void;
}

export const useFeeStore = create<FeeState>((set) => ({
  mess: defaultSection(),
  academic: defaultSection(),

  setFile: (feeType, file) =>
    set((s) => ({ [feeType]: { ...s[feeType], selectedFile: file } })),

  setBank: (feeType, bank) =>
    set((s) => ({ [feeType]: { ...s[feeType], selectedBank: bank } })),

  setPaymentMethod: (feeType, method) =>
    set((s) => ({ [feeType]: { ...s[feeType], selectedPaymentMethod: method } })),

  setStatus: (feeType, status) =>
    set((s) => ({ [feeType]: { ...s[feeType], verificationStatus: status } })),

  setError: (feeType, message) =>
    set((s) => ({ [feeType]: { ...s[feeType], errorMessage: message, verificationStatus: message ? 'error' : s[feeType].verificationStatus } })),

  setFileUrl: (feeType, url) =>
    set((s) => ({ [feeType]: { ...s[feeType], fileUrl: url } })),
}));
