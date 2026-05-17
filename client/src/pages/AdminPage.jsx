import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Shield, Trash2, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getCategoryMeta } from '../utils/constants';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [tab, setTab] = useState('markers');

  const load = async () => {
    const [s, u, m] = await Promise.all([
      api.getAdminStats(),
      api.getAdminUsers(),
      api.getAdminMarkers(),
    ]);
    setStats(s);
    setUsers(u);
    setMarkers(m);
  };

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const updateStatus = async (id, status) => {
    await api.updateMarkerStatus(id, status);
    load();
  };

  const updateRole = async (id, role) => {
    await api.updateUserRole(id, role);
    load();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their markers?')) return;
    await api.deleteUser(id);
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar onAuthClick={() => {}} />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline mb-6"
        >
          <ArrowLeft size={16} /> Back to map
        </Link>

        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="text-amber-500" /> Admin Panel
        </h1>
        <p className="text-slate-500 mb-8">Manage users, markers, and reports</p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border">
              <p className="text-2xl font-bold">{stats.totalMarkers}</p>
              <p className="text-sm text-slate-400">Total Markers</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border">
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-slate-400">Total Users</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border">
              <p className="text-2xl font-bold">{stats.byStatus?.pending || 0}</p>
              <p className="text-sm text-slate-400">Pending Reports</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border">
              <p className="text-2xl font-bold">{stats.byCategory?.issue || 0}</p>
              <p className="text-sm text-slate-400">Open Issues</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {['markers', 'users'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'markers' && (
          <div className="space-y-3">
            {markers.map((m) => {
              const cat = getCategoryMeta(m.category);
              return (
                <div
                  key={m._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium">
                      {cat.icon} {m.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.createdBy?.name} · {m.status} · {cat.label}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {['active', 'resolved', 'rejected'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(m._id, s)}
                        className={`px-2 py-1 text-xs rounded-lg capitalize ${
                          m.status === s
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    className="px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {u._id !== user._id && (
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
