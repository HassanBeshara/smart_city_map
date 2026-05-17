import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES, REGIONS } from '../utils/constants';

function inferRegion(lat, lng) {
  if (lat >= 33.0 && lat <= 34.8 && lng >= 35.0 && lng <= 36.8) return 'lebanon';
  return 'nyc';
}

export default function AddMarkerModal({ open, onClose, onSubmit, initialCoords, editMarker }) {
  const [title, setTitle] = useState(editMarker?.title || '');
  const [description, setDescription] = useState(editMarker?.description || '');
  const [category, setCategory] = useState(editMarker?.category || 'other');
  const [address, setAddress] = useState(editMarker?.address || '');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState(editMarker?.images || []);
  const [placeRegion, setPlaceRegion] = useState(editMarker?.region || 'lebanon');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const coords = editMarker?.location?.coordinates || initialCoords;

  useEffect(() => {
    if (!coords || editMarker) return;
    const lat = coords[1] ?? coords.lat;
    const lng = coords[0] ?? coords.lng;
    setPlaceRegion(inferRegion(lat, lng));
  }, [coords, editMarker]);

  if (!open) return null;

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) {
      setError('Click on the map to set a location');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        title,
        description,
        category,
        address,
        images,
        region: placeRegion,
        lat: coords[1] ?? coords.lat,
        lng: coords[0] ?? coords.lng,
        id: editMarker?._id,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editMarker ? 'Edit Marker' : 'Add New Place'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {!coords && !editMarker && (
          <p className="text-sm text-amber-600 mb-4">Click on the map to place your marker first.</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
          >
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <select
            value={placeRegion}
            onChange={(e) => setPlaceRegion(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
          >
            {REGIONS.filter((r) => r.id !== 'all').map((r) => (
              <option key={r.id} value={r.id}>
                {r.flag} {r.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
          />

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-sm font-medium"
            >
              Add
            </button>
          </div>
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-16 w-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {coords && (
            <p className="text-xs text-slate-400">
              Location: {(coords[1] ?? coords.lat).toFixed(5)}, {(coords[0] ?? coords.lng).toFixed(5)}
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !title}
            className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : editMarker ? 'Update' : 'Create Marker'}
          </button>
        </form>
      </div>
    </div>
  );
}
