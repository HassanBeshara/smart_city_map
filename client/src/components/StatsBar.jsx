import { MapPin, Users, AlertTriangle, Building2 } from 'lucide-react';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { icon: MapPin, label: 'Places', value: stats.totalMarkers, color: 'text-brand-600' },
    { icon: Users, label: 'Users', value: stats.totalUsers, color: 'text-emerald-600' },
    {
      icon: AlertTriangle,
      label: 'Issues',
      value: stats.byCategory?.issue || 0,
      color: 'text-orange-600',
    },
    {
      icon: Building2,
      label: 'Hospitals',
      value: stats.byCategory?.hospital || 0,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="hidden lg:flex absolute top-20 left-1/2 -translate-x-1/2 z-[500] gap-3">
      {items.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <Icon size={16} className={color} />
          <div>
            <p className="text-lg font-bold leading-none">{value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
