import { Navigation, X } from 'lucide-react';

export default function RoutePanel({
  routeMode,
  onToggleRouteMode,
  routeFrom,
  routeTo,
  routeInfo,
  onClear,
}) {
  if (!routeMode && !routeInfo) return null;

  return (
    <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[500] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Navigation size={18} className="text-brand-600" />
          Route Navigation
        </h3>
        <button onClick={onClear} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>

      {routeMode && !routeInfo && (
        <p className="text-sm text-slate-500">
          {!routeFrom && 'Click map to set start point'}
          {routeFrom && !routeTo && 'Click map to set destination'}
          {routeFrom && routeTo && 'Calculating route...'}
        </p>
      )}

      {routeFrom && (
        <p className="text-xs text-slate-400 mt-1">
          From: {routeFrom[0].toFixed(4)}, {routeFrom[1].toFixed(4)}
        </p>
      )}
      {routeTo && (
        <p className="text-xs text-slate-400">
          To: {routeTo[0].toFixed(4)}, {routeTo[1].toFixed(4)}
        </p>
      )}

      {routeInfo && (
        <div className="mt-2 p-3 rounded-xl bg-brand-50 dark:bg-brand-950">
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Distance: {(routeInfo.distance / 1000).toFixed(2)} km
          </p>
          <p className="text-sm text-brand-600 dark:text-brand-400">
            Duration: ~{Math.round(routeInfo.duration / 60)} min
          </p>
        </div>
      )}

      <button
        onClick={onToggleRouteMode}
        className={`mt-3 w-full py-2 text-sm rounded-xl font-medium transition-colors ${
          routeMode
            ? 'bg-slate-200 dark:bg-slate-700'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {routeMode ? 'Cancel routing' : 'Plan new route'}
      </button>
    </div>
  );
}
