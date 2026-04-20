import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

type Company = {
  id: number;
  name: string;
  description: string;
  requirements: string;
  arrival_date: string;
  package_details: string;
  max_rounds?: number;
};

type Student = {
  student_id: string;
  name: string;
  department: string;
  semester: number;
};

export default function PlacementManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    requirements: '',
    arrival_date: '',
    package_details: '',
    max_rounds: 6,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companyRes, studentRes] = await Promise.all([
        api.get('/placements/companies'),
        api.get('/admin/students'),
      ]);
      setCompanies(companyRes.data || []);
      setStudents(studentRes.data || []);
      if (companyRes.data?.length) {
        setSelectedCompanyId(companyRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load placement data', error);
    }
  };

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === Number(selectedCompanyId)),
    [companies, selectedCompanyId]
  );

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/placements/companies', {
        name: companyForm.name,
        description: companyForm.description,
        requirements: companyForm.requirements,
        arrival_date: companyForm.arrival_date,
        package_details: companyForm.package_details,
        max_rounds: companyForm.max_rounds,
      });
      setMessage('Company added and notifications sent to faculty and students.');
      setCompanyForm({
        name: '',
        description: '',
        requirements: '',
        arrival_date: '',
        package_details: '',
        max_rounds: 6,
      });
      await fetchData();
    } catch (error: any) {
      setMessage(`Failed to create company: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleRoundSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      setMessage('Please select a company first.');
      return;
    }
    if (selectedStudents.length === 0) {
      setMessage('Select at least one student for this round.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await api.post('/placements/selections', {
        company_id: selectedCompanyId,
        round_number: selectedRound,
        student_ids: selectedStudents,
      });
      setMessage('Round selection saved. Selected students were notified.');
      setSelectedStudents([]);
    } catch (error: any) {
      setMessage(`Failed to save selections: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Placement Management</h1>
        <p className="text-gray-400 mt-1">
          Add company details, notify campus users, and publish round-wise selected students.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-effect rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Add Visiting Company</h2>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <input
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
              placeholder="Company name"
              value={companyForm.name}
              onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <textarea
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
              placeholder="Company description"
              value={companyForm.description}
              onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              required
            />
            <textarea
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
              placeholder="Eligibility / requirements"
              value={companyForm.requirements}
              onChange={(e) => setCompanyForm((p) => ({ ...p, requirements: e.target.value }))}
              rows={2}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
                value={companyForm.arrival_date}
                onChange={(e) => setCompanyForm((p) => ({ ...p, arrival_date: e.target.value }))}
                required
              />
              <input
                type="number"
                min={1}
                max={10}
                className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
                value={companyForm.max_rounds}
                onChange={(e) =>
                  setCompanyForm((p) => ({ ...p, max_rounds: Number(e.target.value) || 1 }))
                }
                required
              />
            </div>
            <input
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
              placeholder="CTC / package details"
              value={companyForm.package_details}
              onChange={(e) => setCompanyForm((p) => ({ ...p, package_details: e.target.value }))}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create Company & Send Notification'}
            </button>
          </form>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Round Selection</h2>
          <form onSubmit={handleRoundSelection} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
                value={selectedCompanyId}
                onChange={(e) =>
                  setSelectedCompanyId(e.target.value ? Number(e.target.value) : '')
                }
                required
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={selectedCompany?.max_rounds || 6}
                className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value) || 1)}
                required
              />
            </div>
            <p className="text-sm text-gray-400">
              Pick students selected for Round {selectedRound}
              {selectedCompany?.name ? ` of ${selectedCompany.name}` : ''}.
            </p>
            <div className="max-h-72 overflow-auto border border-gray-800 rounded-lg p-3 space-y-2">
              {students.map((student) => (
                <label
                  key={student.student_id}
                  className="flex items-center justify-between bg-gray-900/40 p-3 rounded-lg cursor-pointer"
                >
                  <span className="text-sm text-gray-200">
                    {student.name} ({student.student_id}) - Sem {student.semester}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.student_id)}
                    onChange={() => toggleStudent(student.student_id)}
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Publish Round Selection'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
