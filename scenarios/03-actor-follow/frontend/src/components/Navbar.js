import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Clapperboard, LogOut, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadUnread = async () => {
      try {
        const data = await api.fetchNotifications();
        if (!cancelled) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        // the bell badge is best-effort; errors surface on the notifications page
      }
    };
    loadUnread();
    window.addEventListener('notifications-updated', loadUnread);
    return () => {
      cancelled = true;
      window.removeEventListener('notifications-updated', loadUnread);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const linkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-100'
    }`;

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-purple-400">
            <Clapperboard size={20} />
            Actor Follow
          </Link>
          <div className="flex items-center gap-5">
            <NavLink to="/" end className={linkClasses}>
              Actors
            </NavLink>
            <NavLink to="/feed" className={linkClasses}>
              Feed
            </NavLink>
            <NavLink to="/following" className={linkClasses}>
              Following
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <Link
              to="/add-movie"
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              <Plus size={16} />
              Add Movie
            </Link>
          )}
          <Link
            to="/notifications"
            className="relative text-zinc-400 transition-colors hover:text-zinc-100"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-purple-300"
            title={user?.name}
          >
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-400 transition-colors hover:text-zinc-100"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
