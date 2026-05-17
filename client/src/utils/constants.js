export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🗺️', color: '#64748b' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍽️', color: '#f59e0b' },
  { id: 'hospital', label: 'Hospitals', icon: '🏥', color: '#ef4444' },
  { id: 'parking', label: 'Parking', icon: '🅿️', color: '#3b82f6' },
  { id: 'event', label: 'Events', icon: '🎉', color: '#8b5cf6' },
  { id: 'issue', label: 'Issues', icon: '⚠️', color: '#f97316' },
  { id: 'other', label: 'Other', icon: '📍', color: '#10b981' },
];

export const REGIONS = [
  { id: 'all', label: 'All regions', flag: '🌍' },
  { id: 'nyc', label: 'New York City', flag: '🇺🇸', center: [40.7484, -73.9857], zoom: 13 },
  { id: 'lebanon', label: 'Lebanon', flag: '🇱🇧', center: [33.8938, 35.5018], zoom: 12 },
];

export const getCategoryMeta = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const getRegionMeta = (id) =>
  REGIONS.find((r) => r.id === id) || REGIONS[0];

/** Default map view — Lebanon (primary for regional users) */
export const DEFAULT_CENTER = REGIONS.find((r) => r.id === 'lebanon').center;
export const DEFAULT_ZOOM = 8;

export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
