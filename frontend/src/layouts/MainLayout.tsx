import { Outlet, Navigate, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Shield, FileText, MessageSquare, Users, Settings, LogOut, LayoutDashboard, Activity, KeyRound, X, Layers } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', passwords);
      alert('Password updated successfully');
      setIsPasswordModalOpen(false);
      setPasswords({ old_password: '', new_password: '' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to change password');
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-indigo-800">
          <Shield className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-wider">TierRAG</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition">
            <LayoutDashboard className="w-5 h-5 text-indigo-300" />
            <span>Dashboard</span>
          </Link>
          <Link to="/cvs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition">
            <FileText className="w-5 h-5 text-indigo-300" />
            <span>CV Library</span>
          </Link>
          <Link to="/chat" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition">
            <MessageSquare className="w-5 h-5 text-indigo-300" />
            <span>AI Assistant</span>
          </Link>
          
          {user.role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Admin</div>
              <Link to="/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition">
                <Users className="w-5 h-5 text-indigo-300" />
                <span>Users</span>
              </Link>
              <Link to="/tiers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition">
                <Layers className="w-5 h-5 text-indigo-300" />
                <span>Tiers</span>
              </Link>
              <Link to="/system" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition">
                <Activity className="w-5 h-5 text-indigo-300" />
                <span>System Status</span>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <div className="mb-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-indigo-300">{user.role}</p>
          </div>
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-3 p-2 w-full rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800 transition mb-2"
          >
            <KeyRound className="w-5 h-5" />
            <span>Change Password</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-3 p-2 w-full rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 border-b">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
              {user.role}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden text-gray-900">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                <input required type="password" value={passwords.old_password} onChange={e => setPasswords({...passwords, old_password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input required type="password" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
