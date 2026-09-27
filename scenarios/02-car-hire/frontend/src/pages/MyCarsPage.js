import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, Power } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const MyCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCars = async () => {
    setLoading(true);
    try {
      const data = await api.fetchMyCars();
      setCars(data.cars || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (car) => {
    if (!window.confirm(`Delete the ${car.make} ${car.model}? This cannot be undone.`)) {
      return;
    }
    try {
      const data = await api.deleteCar(car._id);
      toast.success(data.message);
      loadCars();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggle = async (car) => {
    try {
      const data = await api.toggleAvailability(car._id);
      toast.success(data.message);
      loadCars();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">My Cars</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your listings and availability.</p>
        </div>
        <Link
          to="/list"
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <Plus size={16} />
          List a Car
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : cars.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          You haven't listed any cars yet.
        </p>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
            <div
              key={car._id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-purple-950 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                    {car.year}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      car.available
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-red-950 text-red-300'
                    }`}
                  >
                    {car.available ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin size={12} />
                    {car.location}
                  </span>
                </div>
                <Link
                  to={`/car/${car._id}`}
                  className="block truncate font-semibold text-zinc-100 hover:text-purple-300"
                >
                  {car.make} {car.model}
                </Link>
                <p className="text-xs text-zinc-500">R{car.pricePerDay}/day</p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleToggle(car)}
                  className={`rounded-lg border border-zinc-800 p-2 transition-colors ${
                    car.available
                      ? 'text-emerald-400 hover:border-emerald-800'
                      : 'text-zinc-500 hover:border-zinc-600'
                  }`}
                  title={car.available ? 'Mark unavailable' : 'Mark available'}
                >
                  <Power size={16} />
                </button>
                <button
                  onClick={() => navigate(`/edit/${car._id}`)}
                  className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-purple-700 hover:text-purple-300"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(car)}
                  className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-red-800 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCarsPage;
