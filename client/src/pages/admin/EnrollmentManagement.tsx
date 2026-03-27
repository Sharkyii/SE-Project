import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle, XCircle, Trash2, Eye, X, Search,
  Clock, ExternalLink, Loader2, ChevronDown, FileText, User, Filter,
} from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';
import type { EnrollmentApplication, ApplicationStatus, StudentDocument } from '../../types/enrollment';
import { DOC_LABELS, DEPARTMENTS } from '../../types/enrollment';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => (
  <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', {
    'bg-yellow-500/10 text-yellow-400': status === 'pending',
    'bg-green-500/10 text-green-400': status === 'approved',
    'bg-red-500/10 text-red-400': status === 'rejected',
  })}>
    {status === 'pending' && <Clock className="w-3 h-3" />}
    {status === 'approved' && <CheckCircle className="w-3 h-3" />}
    {status === 'rejected' && <XCircle className="w-3 h-3" />}
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

// ── Document Preview Modal ────────────────────────────────────────────────────
const DocPreviewModal: React.FC<{ doc: StudentDocument; onClose: () => void }> = ({ doc, onClose }) => {
  const isPdf = doc.file_url.toLowerCase().includes('.pdf');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <p className="text-white font-semibold">{DOC_LABELS[doc.doc_type]}</p>
          <div className="flex items-center gap-3">
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline">
              Open <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-950 min-h-0">
          {isPdf ? (
            <iframe src={doc.file_url} className="w-full h-full min-h-[420px]" title={doc.doc_type} />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[420px] p-4">
              <img src={doc.file_url} alt={doc.doc_type} className="max-w-full max-h-[500px] object-contain rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  app: EnrollmentApplication;
  onClose: () => void;
  onAction: (id: number, status: 'approved' | 'rejected', remarks?: string) => void;
  loading: boolean;
}> = ({ app, onClose, onAction, loading }) => {
  const [remarks, setRemarks] = useState(app.remarks || '');
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">{app.full_name}</p>
              <p className="text-gray-400 text-sm">{app.email} · {app.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Info Grid */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Personal & Academic Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ['Department', app.department],
                ['Semester', `Semester ${app.semester}`],
                ['Section', app.section],
                ['Gender', app.gender || '—'],
                ['Date of Birth', app.date_of_birth ? new Date(app.date_of_birth).toLocaleDateString() : '—'],
                ['Applied On', new Date(app.created_at).toLocaleDateString()],
                ['Guardian', app.guardian_name || '—'],
                ['Guardian Phone', app.guardian_phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-white text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {app.address && (
              <div className="bg-gray-800 rounded-lg p-3 mt-2">
                <p className="text-gray-500 text-xs">Address</p>
                <p className="text-white text-sm mt-0.5">{app.address}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Uploaded Documents</p>
            {app.student_documents && app.student_documents.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {app.student_documents.map(doc => (
                  <button key={doc.id} onClick={() => setPreviewDoc(doc)}
                    className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-3 text-left transition-colors group">
                    <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium">{DOC_LABELS[doc.doc_type]}</p>
                      <p className="text-gray-500 text-xs truncate">{doc.original_name}</p>
                    </div>
                    <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm bg-gray-800 rounded-lg p-4 text-center">No documents uploaded</p>
            )}
          </div>

          {/* Remarks */}
          {app.status === 'pending' ? (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Remarks (optional)</p>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2}
                placeholder="Add remarks for the applicant..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          ) : app.remarks ? (
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Admin Remarks</p>
              <p className="text-white text-sm mt-1">{app.remarks}</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between shrink-0">
          <StatusBadge status={app.status} />
          {app.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onAction(app.id, 'rejected', remarks)} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
              <button onClick={() => onAction(app.id, 'approved', remarks)} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve
              </button>
            </div>
          )}
        </div>
      </div>

      {previewDoc && <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EnrollmentManagement() {
  const [applications, setApplications] = useState<EnrollmentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selected, setSelected] = useState<EnrollmentApplication | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter !== 'all') params.status = filter;
      if (deptFilter) params.department = deptFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/enrollments', { params });
      setApplications(data);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, [filter, deptFilter, search]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleAction = async (id: number, status: 'approved' | 'rejected', remarks?: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/enrollments/${id}/status`, { status, remarks });
      setSelected(null);
      fetchApplications();
    } catch { /* handled */ }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application? This cannot be undone.')) return;
    try {
      await api.delete(`/enrollments/${id}`);
      if (selected?.id === id) setSelected(null);
      fetchApplications();
    } catch { /* handled */ }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Enrollment Management</h1>
        <p className="text-gray-400 text-sm mt-1">Review and manage student registration applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { label: 'Total', value: counts.all, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Pending', value: counts.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Approved', value: counts.approved, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-400', bg: 'bg-red-500/10' },
        ] as const).map(s => (
          <div key={s.label} className={clsx('rounded-xl p-4 border border-gray-700', s.bg)}>
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={clsx('text-3xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-8 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors', {
              'bg-blue-600 text-white': filter === tab.key,
              'text-gray-400 hover:text-white': filter !== tab.key,
            })}>
            {tab.label}
            <span className={clsx('ml-1.5 text-xs', filter === tab.key ? 'text-blue-200' : 'text-gray-600')}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No applications found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  {['Applicant', 'Department', 'Semester', 'Docs', 'Applied On', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium text-sm">{app.full_name}</p>
                        <p className="text-gray-500 text-xs">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{app.department}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">Sem {app.semester}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                        <FileText className="w-3.5 h-3.5" />
                        {app.student_documents?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelected(app)} title="View Details"
                          className="p-1.5 rounded-lg bg-gray-700 hover:bg-blue-600 text-gray-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(app.id, 'approved')} title="Approve"
                              className="p-1.5 rounded-lg bg-gray-700 hover:bg-green-600 text-gray-400 hover:text-white transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(app.id, 'rejected')} title="Reject"
                              className="p-1.5 rounded-lg bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(app.id)} title="Delete"
                          className="p-1.5 rounded-lg bg-gray-700 hover:bg-red-700 text-gray-400 hover:text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
