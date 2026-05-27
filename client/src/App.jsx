import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IngestPage from './pages/IngestPage';
import ReviewPage from './pages/ReviewPage';
import useAuthStore from './store/authStore';

const Layout = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
    <Navbar />
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>{children}</main>
    </div>
  </div>
);

const App = () => {
  const token = useAuthStore((s) => s.token);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
        <Route path="/ingest" element={<PrivateRoute><Layout><IngestPage /></Layout></PrivateRoute>} />
        <Route path="/review" element={<PrivateRoute><Layout><ReviewPage /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
