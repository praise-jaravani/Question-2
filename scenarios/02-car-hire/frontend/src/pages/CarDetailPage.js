import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Pencil, Trash2, Power } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';

const CarDetailPage = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [booking, setBooking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadCar = async () => {
    try {
      const data = await api.fetchCar(id);
      setCar(data.car);
    } catch (error) {
      toast.error(error.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const data = await api.createBooking(car._id, { startDate, endDate });
      toast.success(data.message);
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBooking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the ${car.make} ${car.model}? This cannot be undone.`)) {
      return;
    }
    try {
      const data = await api.deleteCar(car._id);
      toast.success(data.message);
      navigate('/my-cars');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggle = async () => {
    try {
      const data = await api.toggleAvailability(car._id);
      toast.success(data.message);
      loadCar();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!car) {
    return null;
  }

  const isOwner = user && car.owner && user._id === car.owner._id;

  const nights =
    startDate && endDate
      ? Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <ArrowLeft size={16} />
        Back to all cars
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full bg-purple-950 px-3 py-1 text-xs font-medium text-purple-300">
          {car.year}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            car.available ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
          }`}
        >
          {car.available ? 'Available' : 'Unavailable'}
        </span>
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <MapPin size={12} />
          {car.location}
        </span>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-zinc-100">
            {car.make} {car.model}
          </h1>
          <p className="mt-2 text-lg font-semibold text-purple-300">
            R{car.pricePerDay}
            <span className="text-sm font-normal text-zinc-500">/day</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Listed by {car.owner?.name || 'Unknown'}
          </p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-emerald-800 hover:text-emerald-300"
            >
              <Power size={14} />
              {car.available ? 'Mark unavailable' : 'Mark available'}
            </button>
            <button
              onClick={() => navigate(`/edit/${car._id}`)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-purple-700 hover:text-purple-300"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-red-800 hover:text-red-400"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="mb-8 border-b border-zinc-800 pb-6 text-[15px] leading-7 text-zinc-300">
        {car.description}
      </p>

      {!isOwner && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Book this car</h2>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>
            {nights > 0 && (
              <p className="text-sm text-zinc-400">
                {nights} day{nights === 1 ? '' : 's'} × R{car.pricePerDay} ={' '}
                <span className="font-semibold text-purple-300">
                  R{nights * car.pricePerDay}
                </span>
              </p>
            )}
            <button
              type="submit"
              disabled={booking}
              className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
            >
              {booking ? 'Booking…' : 'Book Now'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CarDetailPage;
