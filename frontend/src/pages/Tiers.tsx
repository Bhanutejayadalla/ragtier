import { useState, useEffect } from 'react';
import api from '../services/api';
import { Layers, Plus, Trash2, X } from 'lucide-react';

interface Tier {
  id: number;
  name: string;
  level: number;
}

const Tiers = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTier, setNewTier] = useState({ name: '', level: 1 });

  const fetchTiers = async () => {
    try {
      const res = await api.get('/admin/tiers');
      setTiers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/tiers', newTier);
      setIsAddOpen(false);
      setNewTier({ name: '', level: 1 });
      fetchTiers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create tier');
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    try {
      await api.delete(`/admin/tiers/${id}`);
      fetchTiers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete tier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tier Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage access tiers dynamically. (Lower level number = Higher access)</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tier</span>
        </button>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Add New Tier</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTier} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name (e.g., TIER_4)</label>
                <input required type="text" value={newTier.name} onChange={e => setNewTier({...newTier, name: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hierarchy Level (1 = highest access)</label>
                <input required type="number" min="1" value={newTier.level} onChange={e => setNewTier({...newTier, level: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hierarchy Level</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                 <tr><td colSpan={3} className="px-6 py-10 text-center">Loading...</td></tr>
              ) : tiers.length === 0 ? (
                 <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500">No tiers found.</td></tr>
              ) : (
                tiers.map(tier => (
                  <tr key={tier.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-900">{tier.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Level {tier.level}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDeleteTier(tier.id)} className="text-red-500 hover:text-red-700 transition">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tiers;
