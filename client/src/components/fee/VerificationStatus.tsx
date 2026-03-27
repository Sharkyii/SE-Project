import React from 'react';
import type { VerificationStatus as VS } from '../../types/fee';
import { CheckCircle, Loader2, XCircle, Upload, Clock } from 'lucide-react';

interface Props {
  status: VS;
}

const VerificationStatus: React.FC<Props> = ({ status }) => {
  if (status === 'idle') {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
        <Upload className="w-4 h-4" /> Not uploaded
      </span>
    );
  }
  if (status === 'uploading' || status === 'verifying') {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-yellow-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-sm text-blue-500">
          <Clock className="w-4 h-4" /> Pending Admin Approval
        </span>
        <span className="text-xs text-gray-400">Updates typically within 12 hours</span>
      </div>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-green-500">
        <CheckCircle className="w-4 h-4" /> Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-red-500">
        <XCircle className="w-4 h-4" /> Rejected — please re-upload
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm text-red-500">
      <XCircle className="w-4 h-4" /> Upload failed
    </span>
  );
};

export default VerificationStatus;
