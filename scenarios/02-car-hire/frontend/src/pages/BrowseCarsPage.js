import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';
import CarCard from '../components/CarCard';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const CITIES = ['Cape Town', 'Johannesburg', 'Durban'];

const BrowseCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.fetchCars({ location });
        if (!cancelled) {
          setCars(data.cars || []);
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
  }, [location]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold text-zinc-100">Find Your Drive</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Rent a car from owners across the country.
      </p>

      <div className="relative mb-4">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Filter by location…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-600 focus:outline-none"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setLocation('')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            location === ''
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Anywhere
        </button>
        {CITIES.map((city) => (
          <button
            key={city}
            onClick={() => setLocation(city)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              location === city
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : cars.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">No cars found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCarsPage;
