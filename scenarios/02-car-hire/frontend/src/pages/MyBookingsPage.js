import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.fetchMyBookings();
        if (!cancelled) {
          setBookings(data.bookings || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold text-zinc-100">My Bookings</h1>
      <p className="mb-6 text-sm text-zinc-500">Trips you have booked.</p>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          You haven't booked any cars yet.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {booking.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <CalendarDays size={12} />
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </span>
                </div>
                {booking.car ? (
                  <Link
                    to={`/car/${booking.car._id}`}
                    className="block truncate font-semibold text-zinc-100 hover:text-purple-300"
                  >
                    {booking.car.make} {booking.car.model}
                  </Link>
                ) : (
                  <span className="font-semibold text-zinc-500">Car no longer listed</span>
                )}
              </div>
              <div className="ml-4 shrink-0 text-right">
                <p className="text-lg font-semibold text-purple-300">R{booking.totalPrice}</p>
                <p className="text-xs text-zinc-500">total</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
