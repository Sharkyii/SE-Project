import React, { useEffect, useRef, useState } from 'react';
import {
  Upload, CheckCircle, XCircle, Clock,
  Loader2, AlertCircle, FileText, Trash2, ExternalLink, RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';
import type { EnrollmentApplication } from '../../types/enrollment';
import { DEPARTMENTS, DOC_LABELS } from '../../types/enrollment';
import { useStore } from '../../app/store';

type DocField = 'aadhar_card' | 'college_id' | 'photo' | 'other';

const DOC_FIELDS: { field: DocField; label: string; required: boolean; hint: string }[] = [
  { field: 'aadhar_card', label: 'Aadhar Card', required: true, hint: 'PDF or image, max 5MB' },
  { field: 'college_id', label: 'College ID', required: true, hint: 'PDF or image, max 5MB' },
  { field: 'photo', label: 'Passport Photo', required: false, hint: 'JPG/PNG, max 5MB' },
  { field: 'other', label: 'Other Document', required: false, hint: 'Any supporting document' },
];

// ── Status View ───────────────────────────────────────────────────────────────
const ApplicationStatusView: React.FC<{ app: EnrollmentApplication; onRefresh?: () => void }> = ({ app, onRefresh }) => (
  <div className="max-w-2xl mx-auto space-y-5">
    <div className={clsx('rounded-2xl border p-6 text-center', {
      'border-yellow-500/30 bg-yellow-500/5': app.status === 'pending',
      'border-green-500/30 bg-green-500/5': app.status === 'approved',
      'border-red-500/30 bg-red-500/5': app.status === 'rejected',
    })}>
      {app.status === 'pending' && <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />}
      {app.status === 'approved' && <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />}
      {app.status === 'rejected' && <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />}
      <h2 className={clsx('text-xl font-bold', {
        'text-yellow-400': app.status === 'pending',
        'text-green-400': app.status === 'approved',
        'text-red-400': app.status === 'rejected',
      })}>
        {app.status === 'pending' && 'Application Under Review'}
        {app.status === 'approved' && 'Registration Complete'}
        {app.status === 'rejected' && 'Application Rejected'}
      </h2>
      <p className="text-gray-400 text-sm mt-2">
        {app.status === 'pending' && 'Your application is being reviewed. Please check back later.'}
        {app.status === 'approved' && 'Congratulations! Your enrollment has been approved. You are now a registered student.'}
        {app.status === 'rejected' && 'Your application was not approved. Contact admin for details.'}
      </p>
      {app.remarks && (
        <div className="mt-4 bg-gray-800 rounded-lg p-3 text-left">
          <p className="text-gray-400 text-xs mb-1">Admin Remarks</p>
          <p className="text-white text-sm">{app.remarks}</p>
        </div>
      )}
      {app.status === 'pending' && onRefresh && (
        <button onClick={onRefresh}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
          Check Status
        </button>
      )}
    </div>

    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-3">
      <h3 className="text-white font-semibold">Application Details</h3>
      <div className="grid grid-cols-2 gap-2">
        {([
          ['Name', app.full_name], ['Email', app.email], ['Phone', app.phone],
          ['Department', app.department], ['Semester', `Semester ${app.semester}`], ['Section', app.section],
          ['Applied On', new Date(app.created_at).toLocaleDateString()],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="bg-gray-900 rounded-lg p-3">
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="text-white text-sm font-medium mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>

    {app.student_documents && app.student_documents.length > 0 && (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-3">
        <h3 className="text-white font-semibold">Uploaded Documents</h3>
        <div className="space-y-2">
          {app.student_documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-white text-sm">{DOC_LABELS[doc.doc_type]}</p>
                  <p className="text-gray-500 text-xs">{doc.original_name}</p>
                </div>
              </div>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ── Doc Upload Field ──────────────────────────────────────────────────────────
const DocUploadField: React.FC<{
  label: string; required: boolean; hint: string;
  file: File | null; onChange: (f: File | null) => void;
}> = ({ label, required, hint, file, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div onClick={() => ref.current?.click()}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors',
          file ? 'border-green-500/50 bg-green-500/5' : 'border-gray-600 hover:border-blue-500 bg-gray-900'
        )}>
        <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={e => onChange(e.target.files?.[0] || null)} />
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-green-400 text-sm font-medium truncate">{file.name}</p>
              <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button type="button"
              onClick={e => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ''; }}
              className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
            <p className="text-gray-400 text-sm">Click to upload</p>
            <p className="text-gray-600 text-xs mt-0.5">{hint}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Text Field ────────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string; name: string; value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string; required?: boolean; placeholder?: string;
}> = ({ label, name, value, onChange, type = 'text', required, placeholder }) => (
  <div>
    <label className="block text-gray-400 text-sm mb-1.5">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange}
      required={required} placeholder={placeholder}
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500" />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentRegistration() {
  const { user } = useStore();
  const [existingApp, setExistingApp] = useState<EnrollmentApplication | null>(null);
  const [checkingApp, setCheckingApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [docs, setDocs] = useState<Partial<Record<DocField, File>>>({});

  const [form, setForm] = useState({
    full_name: '', email: user?.email || '', phone: '', date_of_birth: '',
    gender: '', department: '', semester: '', section: 'A',
    address: '', guardian_name: '', guardian_phone: '',
  });

  useEffect(() => {
    api.get('/enrollments/my')
      .then(r => setExistingApp(r.data))
      .catch(() => { /* no existing app — show form */ })
      .finally(() => setCheckingApp(false));
  }, []);

  // Poll every 10s while pending so status updates automatically
  useEffect(() => {
    if (!existingApp || existingApp.status !== 'pending') return;
    const interval = setInterval(() => {
      api.get('/enrollments/my')
        .then(r => setExistingApp(r.data))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [existingApp?.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleDocChange = (field: DocField, file: File | null) =>
    setDocs(d => { const n = { ...d }; file ? (n[field] = file) : delete n[field]; return n; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!docs.aadhar_card || !docs.college_id) {
      setError('Aadhar Card and College ID are required documents.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Always use the logged-in user's email
      const submitForm = { ...form, email: user?.email || form.email };
      Object.entries(submitForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      Object.entries(docs).forEach(([field, file]) => { if (file) fd.append(field, file as File); });
      const { data } = await api.post('/enrollments/apply', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExistingApp(data.application);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingApp) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (existingApp) {
    const refresh = () => {
      api.get('/enrollments/my')
        .then(r => setExistingApp(r.data))
        .catch(() => {});
    };
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className={clsx('text-2xl font-bold', {
            'text-yellow-400': existingApp.status === 'pending',
            'text-green-400': existingApp.status === 'approved',
            'text-red-400': existingApp.status === 'rejected',
          })}>
            {existingApp.status === 'approved' ? 'Registration Complete' : 'My Registration'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {existingApp.status === 'approved'
              ? 'Your enrollment has been approved by the admin.'
              : 'Track your enrollment application status'}
          </p>
        </div>
        <ApplicationStatusView app={existingApp} onRefresh={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-400">Student Registration</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in your details and upload required documents to apply for enrollment</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Personal Information */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Enter full name" />
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Email Address *</label>
              <input type="email" name="email" value={form.email} readOnly
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-400 text-sm cursor-not-allowed" />
            </div>
            <Field label="Phone Number *" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" />
            <Field label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2}
              placeholder="Enter your full address"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Academic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Semester *</label>
              <select name="semester" value={form.semester} onChange={handleChange} required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Section</label>
              <select name="section" value={form.section} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Guardian Information */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Guardian Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guardian Name" name="guardian_name" value={form.guardian_name} onChange={handleChange} placeholder="Parent / Guardian name" />
            <Field label="Guardian Phone" name="guardian_phone" value={form.guardian_phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
          </div>
        </section>

        {/* Document Upload */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <div>
            <h2 className="text-white font-semibold text-lg">Document Upload</h2>
            <p className="text-gray-400 text-sm mt-1">Aadhar Card and College ID are mandatory</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOC_FIELDS.map(({ field, label, required, hint }) => (
              <DocUploadField key={field} label={label} required={required} hint={hint}
                file={docs[field] || null} onChange={f => handleDocChange(field, f)} />
            ))}
          </div>
        </section>

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {submitting ? 'Submitting Application...' : 'Submit Registration Application'}
        </button>
      </form>
    </div>
  );
}
