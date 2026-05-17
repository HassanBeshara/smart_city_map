import { Plus, Flame, Navigation, Locate, Heart } from 'lucide-react';
import SearchFilter from './SearchFilter';
import MarkerDetail from './MarkerDetail';
import { getCategoryMeta, getRegionMeta, REGIONS } from '../utils/constants';

export default function Sidebar({
  open,
  markers,
  selectedMarker,
  onSelectMarker,
  onCloseDetail,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  region,
  onRegionChange,
  onFlyToRegion,
  nearestPlaces,
  onAddClick,
  showHeatmap,
  onToggleHeatmap,
  onToggleRoute,
  routeMode,
  onLocate,
  onEdit,
  onDelete,
  onFlyTo,
  user,
  onAuthClick,
}) {
  return (
    <aside
      className={`fixed top-[57px] left-0 bottom-0 z-[900] w-full sm:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl transition-transform duration-300 flex flex-col ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {region === 'all' ? (
            <>
              Showing places in{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">New York City</span> and{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">Lebanon</span>
            </>
          ) : (
            <>
              Showing places in{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {getRegionMeta(region).flag} {getRegionMeta(region).label}
              </span>
            </>
          )}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onRegionChange(r.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                region === r.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r.flag} {r.label}
            </button>
          ))}
        </div>

        {region === 'all' && (
          <div className="flex gap-2">
            {REGIONS.filter((r) => r.center).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onFlyToRegion(r.id)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Zoom to {r.label}
              </button>
            ))}
          </div>
        )}

        <SearchFilter
          search={search}
          onSearchChange={onSearchChange}
          category={category}
          onCategoryChange={onCategoryChange}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={user ? onAddClick : onAuthClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-medium rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            <Plus size={16} />
            Add Place
          </button>
          <button
            onClick={onLocate}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="My location"
          >
            <Locate size={18} />
          </button>
          <button
            onClick={onToggleRoute}
            className={`p-2 rounded-xl border transition-colors ${
              routeMode
                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Route"
          >
            <Navigation size={18} />
          </button>
          <button
            onClick={onToggleHeatmap}
            className={`p-2 rounded-xl border transition-colors ${
              showHeatmap
                ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Heatmap"
          >
            <Flame size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedMarker ? (
          <div className="p-4">
            <MarkerDetail
              marker={selectedMarker}
              onClose={onCloseDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onFlyTo={onFlyTo}
            />
          </div>
        ) : (
          <>
            {nearestPlaces?.length > 0 && (
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Locate size={12} /> Nearest Places
                </h4>
                <div className="space-y-2">
                  {nearestPlaces.map((m) => {
                    const cat = getCategoryMeta(m.category);
                    return (
                      <button
                        key={m._id}
                        onClick={() => onSelectMarker(m)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-sm font-medium">{cat.icon} {m.title}</span>
                        <p className="text-xs text-slate-400 truncate">{m.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Places ({markers.length})
              </h4>
              <div className="space-y-1">
                {markers.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No places found</p>
                ) : (
                  markers.map((m) => {
                    const cat = getCategoryMeta(m.category);
                    return (
                      <button
                        key={m._id}
                        onClick={() => onSelectMarker(m)}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${cat.color}22` }}
                          >
                            {cat.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{m.title}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {getRegionMeta(m.region || 'nyc').flag} {cat.label}
                              {m.address ? ` · ${m.address}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
