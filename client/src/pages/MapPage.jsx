import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import AuthModal from '../components/AuthModal';
import AddMarkerModal from '../components/AddMarkerModal';
import RoutePanel from '../components/RoutePanel';
import StatsBar from '../components/StatsBar';
import { api } from '../utils/api';
import { getRegionMeta } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

async function fetchRoute(from, to) {
  const [fromLat, fromLng] = from;
  const [toLat, toLng] = to;
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('Route not found');
  return {
    geometry: data.routes[0].geometry,
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
  };
}

export default function MapPage() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const socket = useSocket();

  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editMarker, setEditMarker] = useState(null);
  const [clickCoords, setClickCoords] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const [flyZoom, setFlyZoom] = useState(undefined);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestPlaces, setNearestPlaces] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState(null);
  const [routeMode, setRouteMode] = useState(false);
  const [routeFrom, setRouteFrom] = useState(null);
  const [routeTo, setRouteTo] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const loadMarkers = useCallback(async () => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (region !== 'all') params.region = region;
      if (search) params.search = search;
      const data = await api.getMarkers(params);
      setMarkers(data);
    } catch (err) {
      console.error(err);
    }
  }, [category, region, search]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  useEffect(() => {
    api.getHeatmap().then(setHeatmapData).catch(() => {});
    if (user?.role === 'admin') {
      api.getAdminStats().then(setStats).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const onCreated = (m) => setMarkers((prev) => [m, ...prev.filter((x) => x._id !== m._id)]);
    const onUpdated = (m) => setMarkers((prev) => prev.map((x) => (x._id === m._id ? m : x)));
    const onDeleted = ({ _id }) => {
      setMarkers((prev) => prev.filter((x) => x._id !== _id));
      if (selectedMarker?._id === _id) setSelectedMarker(null);
    };
    socket.on('marker:created', onCreated);
    socket.on('marker:updated', onUpdated);
    socket.on('marker:deleted', onDeleted);
    return () => {
      socket.off('marker:created', onCreated);
      socket.off('marker:updated', onUpdated);
      socket.off('marker:deleted', onDeleted);
    };
  }, [socket, selectedMarker]);

  useEffect(() => {
    if (!userLocation) return;
    api
      .getNearest({
        lat: userLocation[0],
        lng: userLocation[1],
        limit: 5,
        category,
        ...(region !== 'all' ? { region } : {}),
      })
      .then(setNearestPlaces)
      .catch(() => {});
  }, [userLocation, category, region]);

  const handleFlyToRegion = (regionId) => {
    const meta = getRegionMeta(regionId);
    if (meta.center) {
      setFlyTo(meta.center);
      setFlyZoom(meta.zoom);
    }
  };

  const handleRegionChange = (next) => {
    setRegion(next);
    if (next !== 'all') handleFlyToRegion(next);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setFlyTo(loc);
        socket?.emit('location:update', { lat: loc[0], lng: loc[1] });
      },
      () => alert('Could not get your location')
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        socket?.emit('location:update', { lat: loc[0], lng: loc[1] });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket]);

  const handleMapClick = ({ lat, lng }) => {
    setClickCoords({ lat, lng });
    setAddMode(false);
    if (!addOpen) {
      setAddOpen(true);
    }
  };

  const handleAddClick = () => {
    setAddMode(true);
    setEditMarker(null);
    setClickCoords(null);
    setAddOpen(true);
  };

  const handleSubmitMarker = async (data) => {
    if (data.id) {
      await api.updateMarker(data.id, data);
    } else {
      await api.createMarker(data);
    }
    loadMarkers();
    setAddMode(false);
    setClickCoords(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this marker?')) return;
    await api.deleteMarker(id);
    setSelectedMarker(null);
    loadMarkers();
  };

  const handleRouteClick = async (point) => {
    if (!routeFrom) {
      setRouteFrom(point);
    } else if (!routeTo) {
      setRouteTo(point);
      try {
        const route = await fetchRoute(routeFrom, point);
        setRouteGeometry(route.geometry);
        setRouteInfo({ distance: route.distance, duration: route.duration });
      } catch {
        alert('Could not calculate route');
        setRouteTo(null);
      }
    }
  };

  const clearRoute = () => {
    setRouteMode(false);
    setRouteFrom(null);
    setRouteTo(null);
    setRouteGeometry(null);
    setRouteInfo(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar
        onAuthClick={() => setAuthOpen(true)}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        menuOpen={sidebarOpen}
      />

      <div className="flex-1 flex relative pt-[57px]">
        <Sidebar
          open={sidebarOpen}
          markers={markers}
          selectedMarker={selectedMarker}
          onSelectMarker={setSelectedMarker}
          onCloseDetail={() => setSelectedMarker(null)}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          region={region}
          onRegionChange={handleRegionChange}
          onFlyToRegion={handleFlyToRegion}
          nearestPlaces={nearestPlaces}
          onAddClick={handleAddClick}
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap((h) => !h)}
          onToggleRoute={() => {
            if (routeMode) clearRoute();
            else setRouteMode(true);
          }}
          routeMode={routeMode}
          onLocate={handleLocate}
          onEdit={(m) => {
            setEditMarker(m);
            setAddOpen(true);
          }}
          onDelete={handleDelete}
          onFlyTo={(lat, lng) => {
            setFlyTo([lat, lng]);
            setFlyZoom(15);
          }}
          user={user}
          onAuthClick={() => setAuthOpen(true)}
        />

        <main className="flex-1 lg:ml-96 relative">
          <MapView
            markers={markers}
            selectedMarker={selectedMarker}
            onMarkerClick={setSelectedMarker}
            onMapClick={handleMapClick}
            userLocation={userLocation}
            flyTo={flyTo}
            addMode={addMode}
            routeMode={routeMode}
            onRouteClick={handleRouteClick}
            routeFrom={routeFrom}
            routeTo={routeTo}
            routeGeometry={routeGeometry}
            heatmapData={heatmapData}
            showHeatmap={showHeatmap}
            dark={dark}
            fitAllMarkers
            fitBoundsKey={region}
            flyZoom={flyZoom}
          />

          {user?.role === 'admin' && <StatsBar stats={stats} />}

          <RoutePanel
            routeMode={routeMode}
            onToggleRouteMode={() => (routeMode ? clearRoute() : setRouteMode(true))}
            routeFrom={routeFrom}
            routeTo={routeTo}
            routeInfo={routeInfo}
            onClear={clearRoute}
          />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[800] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <AddMarkerModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditMarker(null);
          setAddMode(false);
        }}
        onSubmit={handleSubmitMarker}
        initialCoords={clickCoords ? [clickCoords.lng, clickCoords.lat] : null}
        editMarker={editMarker}
      />
    </div>
  );
}
