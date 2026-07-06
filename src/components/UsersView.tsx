import { useState, useEffect } from 'react';
import { Trash2, UserPlus, ShieldAlert, Key, MapPin } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../api';
import { Location } from '../types';

export function UsersView({ locations }: { locations: Location[] }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [locationId, setLocationId] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, locationId })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('User created successfully');
        setEmail('');
        setPassword('');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
            <p className="text-sm text-slate-500 mt-1">Create client logins to give them secure access to their own dashboard.</p>
          </div>
          <UserPlus className="w-6 h-6 text-slate-400" />
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="client@domain.com" />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <input required type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Temporary password" />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Location</label>
              <select disabled={role === 'admin'} value={locationId} onChange={e => setLocationId(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1 flex items-end">
              <button type="submit" className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex items-center justify-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </form>
          {error && <p className="text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-md text-sm mt-4">{error}</p>}
          {success && <p className="text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-md text-sm mt-4">{success}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Location Assigned</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.email} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'admin' ? <ShieldAlert className="w-3 h-3 mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {u.role === 'admin' ? 'All Locations' : (locations.find(l => l.id === u.locationId)?.name || u.locationId || 'Unassigned')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteUser(u.email)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
