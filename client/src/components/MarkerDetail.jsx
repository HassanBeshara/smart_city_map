import { X, Heart, MapPin, User, Trash2, Edit } from 'lucide-react';
import { getCategoryMeta, getRegionMeta } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function MarkerDetail({ marker, onClose, onEdit, onDelete, onFlyTo }) {
  const { user, isFavorite, toggleFavorite } = useAuth();
  if (!marker) return null;

  const cat = getCategoryMeta(marker.category);
  const reg = getRegionMeta(marker.region || 'nyc');
  const coords = marker.location?.coordinates;
  const isOwner = user && marker.createdBy?._id === user._id;
  const favorited = isFavorite(marker._id);

  const handleFavorite = async () => {
    if (!user) return;
    await toggleFavorite(marker._id);
  };

  return (
    <div className="animate-slide-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span
              className="inline-block px-2 py-0.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: cat.color }}
            >
              {cat.icon} {cat.label}
            </span>
            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {reg.flag} {reg.label}
            </span>
          </div>
          <h3 className="text-lg font-bold">{marker.title}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={18} />
        </button>
      </div>

      {marker.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
          {marker.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="h-24 w-32 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        {marker.description || 'No description provided.'}
      </p>

      {marker.address && (
        <p className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <MapPin size={14} />
          {marker.address}
        </p>
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <User size={12} />
        {marker.createdBy?.name || 'Unknown'}
      </p>

      <div className="flex flex-wrap gap-2">
        {coords && (
          <button
            onClick={() => onFlyTo?.(coords[1], coords[0])}
            className="flex-1 py-2 px-3 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Center on map
          </button>
        )}
        {user && (
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-xl border transition-colors ${
              favorited
                ? 'border-red-300 bg-red-50 text-red-500 dark:bg-red-950'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
          </button>
        )}
        {isOwner && (
          <>
            <button
              onClick={() => onEdit(marker)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(marker._id)}
              className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
