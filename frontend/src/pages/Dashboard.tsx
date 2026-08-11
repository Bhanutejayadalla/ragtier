import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, Activity } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ cvs: 0, queries: 0 });

  useEffect(() => {
    // In a real app we would fetch stats here
    const fetchStats = async () => {
      try {
        const res = await api.get('/cvs');
        setStats(s => ({ ...s, cvs: res.data.length }));
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const getAccessibleTiers = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'TIER_1': return ['Tier 1', 'Tier 2', 'Tier 3'];
      case 'TIER_2': return ['Tier 2', 'Tier 3'];
      case 'TIER_3': return ['Tier 3'];
      default: return [];
    }
  };

  const accessibleTiers = user ? getAccessibleTiers(user.role) : [];
  const allTiers = ['Tier 1', 'Tier 2', 'Tier 3'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening with your account today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-xl">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Accessible CVs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.cvs}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Your Tier</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{user?.role}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Scope */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Your Access Scope</h3>
        <div className="flex gap-4">
          {allTiers.map(tier => (
            <div key={tier} className={`flex items-center gap-2 p-3 rounded-lg border ${accessibleTiers.includes(tier) ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
              {accessibleTiers.includes(tier) ? (
                <div className="text-sm font-medium">✓ {tier} Access</div>
              ) : (
                <div className="text-sm font-medium opacity-50">✕ {tier} Denied</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
