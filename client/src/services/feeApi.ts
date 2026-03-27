import api from './api';
import type { FeeUploadPayload, FeeUploadResponse } from '../types/fee';

export const uploadFeeReceipt = async (payload: FeeUploadPayload): Promise<FeeUploadResponse> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('fee_type', payload.feeType);
  formData.append('bank', payload.bank);
  formData.append('payment_method', payload.paymentMethod);

  const { data } = await api.post<FeeUploadResponse>('/student/fees/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
