import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { useFeeStore } from '../../app/feeSlice';
import { uploadFeeReceipt } from '../../services/feeApi';
import { validateFeeForm } from '../../utils/feeValidation';
import BankSelector from './BankSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import VerificationStatus from './VerificationStatus';
import type { FeeType, Bank, PaymentMethod } from '../../types/fee';

interface Props {
  feeType: FeeType;
  title: string;
}

const FeeSection: React.FC<Props> = ({ feeType, title }) => {
  const state = useFeeStore((s) => s[feeType]);
  const { setFile, setBank, setPaymentMethod, setStatus, setError, setFileUrl } = useFeeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy = state.verificationStatus === 'uploading' || state.verificationStatus === 'verifying';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateFeeForm(state.selectedFile, state.selectedBank, state.selectedPaymentMethod);
    if (err) { setError(feeType, err); return; }

    setError(feeType, null);
    setStatus(feeType, 'uploading');

    // Simulate verifying animation for 2s before hitting API
    await new Promise((r) => setTimeout(r, 1000));
    setStatus(feeType, 'verifying');
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const res = await uploadFeeReceipt({
        feeType,
        bank: state.selectedBank as Bank,
        paymentMethod: state.selectedPaymentMethod as PaymentMethod,
        file: state.selectedFile!,
      });
      setFileUrl(feeType, res.fileUrl);
      setStatus(feeType, 'pending');
    } catch (err: any) {
      setError(feeType, err?.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const alreadySubmitted = ['pending', 'approved', 'rejected'].includes(state.verificationStatus);

  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        <VerificationStatus status={state.verificationStatus} />
      </div>

      {alreadySubmitted ? (
        <div className="text-sm text-gray-400 space-y-1">
          {state.fileUrl && (
            <a href={state.fileUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline">
              <FileText className="w-4 h-4" /> View uploaded receipt
            </a>
          )}
          {state.verificationStatus === 'rejected' && (
            <button
              className="mt-2 text-xs text-red-400 underline"
              onClick={() => setStatus(feeType, 'idle')}
            >
              Re-upload receipt
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Receipt File</label>
            <div
              className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-400">
                {state.selectedFile ? state.selectedFile.name : 'Click to select JPEG, PNG or PDF'}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              disabled={isBusy}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(feeType, f);
                setError(feeType, null);
              }}
            />
          </div>

          <BankSelector
            value={state.selectedBank}
            onChange={(b) => setBank(feeType, b)}
            disabled={isBusy}
          />

          <PaymentMethodSelector
            value={state.selectedPaymentMethod}
            onChange={(m) => setPaymentMethod(feeType, m)}
            disabled={isBusy}
          />

          {state.errorMessage && (
            <p className="text-sm text-red-400">{state.errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {state.verificationStatus === 'uploading' ? 'Uploading...' : 'Verifying...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Submit Receipt
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeeSection;
