import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const EditCarPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.fetchCar(id);
        if (cancelled) return;
        const car = data.car;
        setMake(car.make || '');
        setModel(car.model || '');
        setYear(String(car.year ?? ''));
        setPricePerDay(String(car.pricePerDay ?? ''));
        setLocation(car.location || '');
        setDescription(car.description || '');
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message);
          navigate('/my-cars');
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
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const carData = { description };
      if (make) carData.make = make;
      if (model) carData.model = model;
      if (year !== '') carData.year = Number(year);
      if (pricePerDay !== '') carData.pricePerDay = Number(pricePerDay);
      if (location) carData.location = location;
      const data = await api.updateCar(id, carData);
      toast.success(data.message);
      navigate('/my-cars');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Edit Car</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Make *</label>
            <input
              type="text"
              value={make}
              required
              onChange={(e) => setMake(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Model *</label>
            <input
              type="text"
              value={model}
              required
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Year *</label>
            <input
              type="number"
              value={year}
              required
              min="1950"
              max="2035"
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Price per day (R) *
            </label>
            <input
              type="number"
              value={pricePerDay}
              required
              min="1"
              onChange={(e) => setPricePerDay(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Location *</label>
            <input
              type="text"
              value={location}
              required
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-zinc-800 px-6 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCarPage;
