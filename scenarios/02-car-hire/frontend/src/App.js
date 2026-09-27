import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import BrowseCarsPage from './pages/BrowseCarsPage';
import MyCarsPage from './pages/MyCarsPage';
import ListCarPage from './pages/ListCarPage';
import EditCarPage from './pages/EditCarPage';
import CarDetailPage from './pages/CarDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0F0F11',
            color: '#F5F5F6',
            border: '1px solid #27272A'
          },
          success: { iconTheme: { primary: '#12B76A', secondary: '#0F0F11' } },
          error: { iconTheme: { primary: '#F04438', secondary: '#0F0F11' } }
        }}
      />
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <BrowseCarsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-cars"
          element={
            <RequireAuth>
              <MyCarsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/list"
          element={
            <RequireAuth>
              <ListCarPage />
            </RequireAuth>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <RequireAuth>
              <EditCarPage />
            </RequireAuth>
          }
        />
        <Route
          path="/car/:id"
          element={
            <RequireAuth>
              <CarDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
