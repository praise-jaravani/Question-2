import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ActorsPage from './pages/ActorsPage';
import ActorDetailPage from './pages/ActorDetailPage';
import FollowingPage from './pages/FollowingPage';
import FeedPage from './pages/FeedPage';
import NotificationsPage from './pages/NotificationsPage';
import AddMoviePage from './pages/AddMoviePage';

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
              <ActorsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/actor/:id"
          element={
            <RequireAuth>
              <ActorDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/following"
          element={
            <RequireAuth>
              <FollowingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/feed"
          element={
            <RequireAuth>
              <FeedPage />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/add-movie"
          element={
            <RequireAuth>
              <AddMoviePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
