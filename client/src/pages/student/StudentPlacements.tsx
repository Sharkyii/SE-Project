import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

type Company = {
  id: number;
  name: string;
  arrival_date: string;
  description?: string;
  requirements?: string;
  package_details?: string;
  max_rounds?: number;
};

type Selection = {
  company_id: number;
  student_id: string;
  round_number: number;
  companies?: { name: string };
};

type CompanySelections = {
  companyId: number;
  rounds: number[];
};

type Notification = {
  id: number;
  message: string;
  read_status: boolean;
  created_at: string;
};

export default function StudentPlacements() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mySelections, setMySelections] = useState<Selection[]>([]);
  const [allSelections, setAllSelections] = useState<Record<number, number[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    setLoading(true);
    try {
      const [companiesRes, mySelectionsRes] = await Promise.all([
        api.get('/placements/companies'),
        api.get('/placements/my-selections'),
      ]);

      const companiesData: Company[] = companiesRes.data || [];
      setCompanies(companiesData);
      setMySelections(mySelectionsRes.data || []);

      const selectionEntries = await Promise.all(
        companiesData.map(async (company) => {
          const res = await api.get(`/placements/selections/${company.id}`);
          const rounds = Array.from(
            new Set<number>((res.data || []).map((entry: any) => Number(entry.round_number)))
          ).sort((a, b) => a - b);
          return [company.id, rounds] as const;
        })
      );
      const roundMap: Record<number, number[]> = {};
      selectionEntries.forEach(([companyId, rounds]) => {
        roundMap[companyId] = rounds;
      });
      setAllSelections(roundMap);
      await fetchPlacementNotifications();
    } catch (error) {
      console.error('Failed to fetch placement module data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacementNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      const placementNotifs = (res.data || []).filter((n: Notification) => {
        const msg = (n.message || '').toLowerCase();
        return msg.includes('company') || msg.includes('placement') || msg.includes('round');
      });
      setNotifications(placementNotifs.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch student notifications', error);
      setNotifications([]);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/student/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const myRoundsByCompany = useMemo(() => {
    return mySelections.reduce<Record<number, CompanySelections>>((acc, selection) => {
      if (!acc[selection.company_id]) {
        acc[selection.company_id] = { companyId: selection.company_id, rounds: [] };
      }
      acc[selection.company_id].rounds.push(selection.round_number);
      return acc;
    }, {});
  }, [mySelections]);

  if (loading) {
    return <div className="p-6 text-gray-300">Loading placement updates...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Placement Status</h1>
        <p className="text-gray-400 mt-1">
          Track each company round and know whether you are selected or not.
        </p>
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

      <div className="space-y-6">
        {companies.map((company) => {
          const publishedRounds = allSelections[company.id] || [];
          const myRounds = myRoundsByCompany[company.id]?.rounds || [];
          const maxRounds = company.max_rounds || 6;

          return (
            <div key={company.id} className="glass-effect rounded-2xl border border-gray-800 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">{company.name}</h2>
                <p className="text-sm text-gray-400">
                  Arrival: {new Date(company.arrival_date).toLocaleDateString()} | Package:{' '}
                  {company.package_details || 'N/A'}
                </p>
                <p className="text-sm text-gray-300 mt-2">{company.description}</p>
                <p className="text-sm text-gray-400 mt-1">Eligibility: {company.requirements}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: maxRounds }).map((_, index) => {
                  const round = index + 1;
                  const isPublished = publishedRounds.includes(round);
                  const isSelected = myRounds.includes(round);
                  return (
                    <div
                      key={round}
                      className={`rounded-lg p-3 border text-sm ${
                        !isPublished
                          ? 'border-gray-700 bg-gray-900/40 text-gray-500'
                          : isSelected
                          ? 'border-green-500/40 bg-green-500/10 text-green-300'
                          : 'border-red-500/40 bg-red-500/10 text-red-300'
                      }`}
                    >
                      <p className="font-semibold">Round {round}</p>
                      <p className="mt-1">
                        {!isPublished
                          ? 'Result not published'
                          : isSelected
                          ? 'Selected'
                          : 'Not selected'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
