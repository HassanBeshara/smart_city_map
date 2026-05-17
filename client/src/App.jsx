import { Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
