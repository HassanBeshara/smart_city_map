import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getCategoryMeta } from '../utils/constants';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [myMarkers, setMyMarkers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getMyMarkers(),
      api.getFavorites(),
      user.role === 'admin' ? api.getAdminStats() : Promise.resolve(null),
    ]).then(([mine, favs, adminStats]) => {
      setMyMarkers(mine);
      setFavorites(favs);
      if (adminStats) setStats(adminStats);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar onAuthClick={() => setAuthOpen(true)} />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline mb-6"
        >
          <ArrowLeft size={16} /> Back to map
        </Link>

        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">Sign in to view your dashboard</h2>
            <p className="text-slate-500 mb-6">Manage your markers and favorites</p>
            <button
              onClick={() => setAuthOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Hello, {user.name}</h1>
            <p className="text-slate-500 mb-8">Your Smart City Map dashboard</p>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Places', value: stats.totalMarkers },
                  { label: 'Total Users', value: stats.totalUsers },
                  { label: 'Active Issues', value: stats.byCategory?.issue || 0 },
                  { label: 'Events', value: stats.byCategory?.event || 0 },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={20} /> My Markers ({myMarkers.length})
                </h2>
                <div className="space-y-2">
                  {myMarkers.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center bg-white dark:bg-slate-900 rounded-2xl">
                      No markers yet.{' '}
                      <Link to="/" className="text-brand-600 hover:underline">
                        Add one on the map
                      </Link>
                    </p>
                  ) : (
                    myMarkers.map((m) => {
                      const cat = getCategoryMeta(m.category);
                      return (
                        <div
                          key={m._id}
                          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <p className="font-medium">{m.title}</p>
                          <p className="text-xs text-slate-400">{cat.label} · {m.status}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart size={20} /> Favorites ({favorites.length})
                </h2>
                <div className="space-y-2">
                  {favorites.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center bg-white dark:bg-slate-900 rounded-2xl">
                      No favorites yet. Explore the map and save places you love.
                    </p>
                  ) : (
                    favorites.map((m) => {
                      const cat = getCategoryMeta(m.category);
                      return (
                        <Link
                          key={m._id}
                          to="/"
                          className="block p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 transition-colors"
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <p className="font-medium">{m.title}</p>
                          <p className="text-xs text-slate-400">{m.description?.slice(0, 60)}</p>
                        </Link>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700"
            >
              <Plus size={18} /> Add new place on map
            </Link>
          </>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
