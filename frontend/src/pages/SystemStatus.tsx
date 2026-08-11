import { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Server, Cpu } from 'lucide-react';

const SystemStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/system/status');
        setStatus(res.data);
      } catch (err) {
        setStatus({ error: 'Failed to fetch status' });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <div>Loading status...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        <p className="mt-1 text-sm text-gray-500">Live backend service health checks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="MySQL Database" icon={<Database className="w-8 h-8 text-blue-500" />} status={status?.mysql} />
        <StatusCard title="ChromaDB" icon={<Server className="w-8 h-8 text-purple-500" />} status={status?.chromadb} />
        <StatusCard title="Ollama" icon={<Cpu className="w-8 h-8 text-green-500" />} status={status?.ollama} />
      </div>
    </div>
  );
};

const StatusCard = ({ title, icon, status }: any) => {
  const isOk = status && status.startsWith('connected');
  
  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className={`text-sm mt-1 ${isOk ? 'text-green-600' : 'text-red-600'}`}>{status || 'unknown'}</p>
      </div>
    </div>
  );
};

export default SystemStatus;
