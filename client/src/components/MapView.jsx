import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getCategoryMeta, DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createIcon(category) {
  const cat = getCategoryMeta(category);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background:${cat.color};
      width:32px;height:32px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
    "><span style="transform:rotate(45deg)">${cat.icon}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick, addMode, routeMode, onRouteClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (routeMode) {
        onRouteClick?.([lat, lng]);
      } else if (addMode) {
        onMapClick?.({ lat, lng });
      }
    },
  });
  return null;
}

function FitAllMarkers({ markers, enabled, boundsKey }) {
  const map = useMap();
  const lastKey = useRef(null);

  useEffect(() => {
    if (!enabled || !markers?.length) return;
    const key = `${boundsKey}-${markers.length}`;
    if (lastKey.current === key) return;
    const points = markers
      .map((m) => m.location?.coordinates)
      .filter(Boolean)
      .map(([lng, lat]) => [lat, lng]);
    if (points.length === 0) return;
    lastKey.current = key;
    const maxZoom = boundsKey === 'all' ? 4 : 14;
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom });
  }, [markers, map, enabled, boundsKey]);

  return null;
}

function HeatmapLayer({ points, visible }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!visible || !points?.length) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const heatData = points.map((p) => [p.lat, p.lng, p.intensity / 10]);
    if (layerRef.current) map.removeLayer(layerRef.current);
    layerRef.current = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.2: 'blue', 0.5: 'lime', 0.8: 'orange', 1: 'red' },
    }).addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, visible]);

  return null;
}

export default function MapView({
  markers,
  selectedMarker,
  onMarkerClick,
  onMapClick,
  userLocation,
  flyTo,
  addMode,
  routeMode,
  onRouteClick,
  routeFrom,
  routeTo,
  routeGeometry,
  heatmapData,
  showHeatmap,
  dark,
  fitAllMarkers,
  fitBoundsKey,
  flyZoom,
}) {

  const routePositions = useMemo(() => {
    if (!routeGeometry?.coordinates) return [];
    return routeGeometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [routeGeometry]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={
          dark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      />

      <FitAllMarkers
        markers={markers}
        enabled={fitAllMarkers && !flyTo}
        boundsKey={fitBoundsKey || 'all'}
      />
      <MapController center={flyTo} zoom={flyZoom} />
      <MapClickHandler
        onMapClick={onMapClick}
        addMode={addMode}
        routeMode={routeMode}
        onRouteClick={onRouteClick}
      />
      <HeatmapLayer points={heatmapData} visible={showHeatmap} />

      <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
        {markers.map((m) => {
          const coords = m.location?.coordinates;
          if (!coords) return null;
          return (
            <Marker
              key={m._id}
              position={[coords[1], coords[0]]}
              icon={createIcon(m.category)}
              eventHandlers={{ click: () => onMarkerClick(m) }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <strong>{m.title}</strong>
                  <p className="text-xs text-slate-500 mt-1">{getCategoryMeta(m.category).label}</p>
                  {m.address && <p className="text-xs text-slate-400 mt-1">{m.address}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={10}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 3 }}
        />
      )}

      {routeFrom && (
        <CircleMarker center={routeFrom} radius={8} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }} />
      )}
      {routeTo && (
        <CircleMarker center={routeTo} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }} />
      )}

      {routePositions.length > 0 && (
        <Polyline positions={routePositions} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }} />
      )}
    </MapContainer>
  );
}
