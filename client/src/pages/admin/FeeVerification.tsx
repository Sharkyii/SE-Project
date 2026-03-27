import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../services/api';
import type { FeeReceiptRecord } from '../../types/fee';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  approved: 'text-green-400 bg-green-900/30 border-green-700',
  rejected: 'text-red-400 bg-red-900/30 border-red-700',
};

const FeeVerification: React.FC = () => {
  const [receipts, setReceipts] = useState<FeeReceiptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchReceipts = async () => {
    try {
      const { data } = await api.get<FeeReceiptRecord[]>('/fees/all');
      setReceipts(data);
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const handleAction = async (id: number, action: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      const { data } = await api.patch<FeeReceiptRecord>(`/fees/${id}/verify`, { action });
      setReceipts((prev) => prev.map((r) => (r.id === id ? data : r)));
    } catch {
      // handled silently
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading receipts...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Fee Receipt Verification</h1>

      {receipts.length === 0 ? (
        <p className="text-gray-400">No receipts submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => (
            <div key={r.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{r.student_name ?? r.student_id}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full border capitalize', statusColors[r.status])}>
                    {r.status}
                  </span>
                </div>
                <p className="text-gray-400">
                  {r.fee_type === 'academic' ? 'Academic Fee' : 'Mess / Hostel Fee'} &nbsp;·&nbsp;
                  {r.bank} &nbsp;·&nbsp; {r.payment_method}
                </p>
                <p className="text-gray-500 text-xs">{new Date(r.uploaded_at).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>

                {r.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(r.id, 'approved')}
                      disabled={actionId === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                    >
                      {actionId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'rejected')}
                      disabled={actionId === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                    >
                      {actionId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeeVerification;
