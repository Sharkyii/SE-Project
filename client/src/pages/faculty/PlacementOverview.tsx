import { useEffect, useState } from 'react';
import api from '../../services/api';

type Company = {
  id: number;
  name: string;
  arrival_date: string;
  max_rounds?: number;
  description?: string;
  requirements?: string;
};

type Selection = {
  id: number;
  round_number: number;
  student_id: string;
  students?: {
    name: string;
    department: string;
    semester: number;
  };
};

type Notification = {
  id: number;
  message: string;
  read_status: boolean;
  created_at: string;
};

export default function PlacementOverview() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [selections, setSelections] = useState<Selection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchSelections(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/placements/companies');
      setCompanies(res.data || []);
      if (res.data?.length) {
        setSelectedCompanyId(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load companies', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/faculty/notifications');
      const placementNotifs = (res.data || []).filter((n: Notification) => {
        const msg = (n.message || '').toLowerCase();
        return msg.includes('company') || msg.includes('placement') || msg.includes('round');
      });
      setNotifications(placementNotifs.slice(0, 6));
    } catch (error) {
      console.error('Failed to load faculty notifications', error);
      setNotifications([]);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/faculty/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const fetchSelections = async (companyId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/placements/selections/${companyId}`);
      setSelections(res.data || []);
    } catch (error) {
      console.error('Failed to load placement selections', error);
      setSelections([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = companies.find((company) => company.id === Number(selectedCompanyId));
  const maxRounds = selectedCompany?.max_rounds || 6;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Placement Rounds Overview</h1>
        <p className="text-gray-400 mt-1">
          Faculty can view company details and round-wise selected students.
        </p>
      </div>

      <div className="glass-effect rounded-2xl p-6 border border-gray-800 space-y-4">
        <select
          className="w-full md:w-80 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
        >
          <option value="">Select company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        {selectedCompany && (
          <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800 text-sm text-gray-300">
            <p>
              <span className="text-white font-semibold">Arrival:</span>{' '}
              {new Date(selectedCompany.arrival_date).toLocaleDateString()}
            </p>
            <p>
              <span className="text-white font-semibold">Description:</span>{' '}
              {selectedCompany.description || 'N/A'}
            </p>
            <p>
              <span className="text-white font-semibold">Requirements:</span>{' '}
              {selectedCompany.requirements || 'N/A'}
            </p>
          </div>
        )}
      </div>

      <div className="glass-effect rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Placement Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No placement notifications right now.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm text-gray-200">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs px-3 py-1 rounded-md bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
                >
                  Mark Read
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400">Loading round selections...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: maxRounds }).map((_, index) => {
            const round = index + 1;
            const roundSelections = selections.filter((selection) => selection.round_number === round);
            return (
              <div key={round} className="glass-effect rounded-2xl p-5 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Round {round}</h3>
                {roundSelections.length === 0 ? (
                  <p className="text-sm text-gray-500">No selected students published yet.</p>
                ) : (
                  <div className="space-y-2">
                    {roundSelections.map((entry) => (
                      <div key={entry.id} className="bg-gray-900/40 rounded-lg p-3 text-sm">
                        <p className="text-blue-300 font-semibold">
                          {entry.students?.name || entry.student_id}
                        </p>
                        <p className="text-gray-400">
                          {entry.students?.department || 'Department N/A'} | Sem{' '}
                          {entry.students?.semester ?? '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
