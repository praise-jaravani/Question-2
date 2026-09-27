import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CarFront, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <CarFront size={20} />
            Car Hire
          </Link>
          <div className="flex items-center gap-5">
            <NavLink to="/" end className={linkClasses}>
              Browse Cars
            </NavLink>
            <NavLink to="/my-cars" className={linkClasses}>
              My Cars
            </NavLink>
            <NavLink to="/my-bookings" className={linkClasses}>
              My Bookings
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/list"
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            <Plus size={16} />
            List a Car
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
