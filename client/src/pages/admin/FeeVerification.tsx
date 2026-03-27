import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Loader2, Clock, MinusCircle, Eye, X } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';

interface Receipt {
  id: number;
  fee_type: string;
  bank: string;
  payment_method: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
}

interface StudentRow {
  student_id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  academic: Receipt | null;
  mess: Receipt | null;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'not_submitted';

// ── Document Preview Modal ──────────────────────────────────────────────────
const PreviewModal: React.FC<{
  receipt: Receipt;
  studentName: string;
  onClose: () => void;
  onAction: (id: number, action: 'approved' | 'rejected') => void;
  actionId: number | null;
}> = ({ receipt, studentName, onClose, onAction, actionId }) => {
  const isPdf = receipt.file_url.toLowerCase().includes('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            <p className="text-white font-semibold">{studentName}</p>
            <p className="text-gray-400 text-sm capitalize">
              {receipt.fee_type === 'academic' ? 'Academic Fee' : 'Mess / Hostel Fee'} &nbsp;·&nbsp;
              {receipt.bank} &nbsp;·&nbsp; {receipt.payment_method}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={receipt.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline">
              Open <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="flex-1 overflow-hidden bg-gray-950 min-h-0">
          {isPdf ? (
            <iframe src={receipt.file_url} className="w-full h-full min-h-[400px]" title="Receipt PDF" />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] p-4">
              <img src={receipt.file_url} alt="Receipt" className="max-w-full max-h-[500px] object-contain rounded-lg" />
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {receipt.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
            {receipt.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-400" />}
            {receipt.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
            <span className={clsx('text-sm font-medium capitalize',
              receipt.status === 'pending' && 'text-yellow-400',
              receipt.status === 'approved' && 'text-green-400',
              receipt.status === 'rejected' && 'text-red-400',
            )}>
              {receipt.status === 'pending' ? 'Awaiting verification' : receipt.status}
            </span>
          </div>

          {receipt.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onAction(receipt.id, 'rejected')} disabled={actionId === receipt.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {actionId === receipt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
              <button onClick={() => onAction(receipt.id, 'approved')} disabled={actionId === receipt.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {actionId === receipt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark as Verified
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Status Cell ─────────────────────────────────────────────────────────────
const StatusCell: React.FC<{
  receipt: Receipt | null;
  onPreview: (r: Receipt) => void;
}> = ({ receipt, onPreview }) => {
  if (!receipt) return (
    <div className="flex items-center gap-1.5">
      <MinusCircle className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-500">Not submitted</span>
    </div>
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {receipt.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
        {receipt.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-400" />}
        {receipt.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
        <span className={clsx('text-xs font-medium capitalize',
          receipt.status === 'pending' && 'text-yellow-400',
          receipt.status === 'approved' && 'text-green-400',
          receipt.status === 'rejected' && 'text-red-400',
        )}>{receipt.status}</span>
      </div>
      <button onClick={() => onPreview(receipt)}
        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline">
        <Eye className="w-3 h-3" /> View & Verify
      </button>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const FeeVerification: React.FC = () => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [preview, setPreview] = useState<{ receipt: Receipt; studentName: string } | null>(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get<StudentRow[]>('/fees/all');
      setRows(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: number, action: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      await api.patch(`/fees/${id}/verify`, { action });
      const { data } = await api.get<StudentRow[]>('/fees/all');
      setRows(data);
      // Update preview receipt status if open
      setPreview(prev => {
        if (!prev || prev.receipt.id !== id) return prev;
        return { ...prev, receipt: { ...prev.receipt, status: action } };
      });
    } catch { /* silent */ }
    finally { setActionId(null); }
  };

  const filtered = rows.filter(r => {
    if (filter === 'pending') return r.academic?.status === 'pending' || r.mess?.status === 'pending';
    if (filter === 'approved') return r.academic?.status === 'approved' && r.mess?.status === 'approved';
    if (filter === 'not_submitted') return !r.academic || !r.mess;
    return true;
  });

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.academic?.status === 'pending' || r.mess?.status === 'pending').length,
    approved: rows.filter(r => r.academic?.status === 'approved' && r.mess?.status === 'approved').length,
    not_submitted: rows.filter(r => !r.academic || !r.mess).length,
  };

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading...
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Fee Receipt Verification</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([['all', 'All Students'], ['pending', 'Pending'], ['approved', 'Fully Verified'], ['not_submitted', 'Not Submitted']] as [FilterTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
              filter === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}>
            {label}
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', filter === key ? 'bg-blue-500' : 'bg-gray-600')}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">No students in this category.</p>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Dept / Sem</th>
                <th className="px-4 py-3 text-left">Academic Fee</th>
                <th className="px-4 py-3 text-left">Mess Fee</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.student_id} className="border-t border-gray-700">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{row.name}</p>
                    <p className="text-gray-500 text-xs">{row.student_id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{row.department} · Sem {row.semester}</td>
                  <td className="px-4 py-3">
                    <StatusCell receipt={row.academic} onPreview={r => setPreview({ receipt: r, studentName: row.name })} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusCell receipt={row.mess} onPreview={r => setPreview({ receipt: r, studentName: row.name })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <PreviewModal
          receipt={preview.receipt}
          studentName={preview.studentName}
          onClose={() => setPreview(null)}
          onAction={handleAction}
          actionId={actionId}
        />
      )}
    </div>
  );
};

export default FeeVerification;
