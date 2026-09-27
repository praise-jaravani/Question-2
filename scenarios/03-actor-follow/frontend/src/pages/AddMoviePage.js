import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';

const AddMoviePage = () => {
  const { user } = useAuth();
  const [actors, setActors] = useState([]);
  const [loadingActors, setLoadingActors] = useState(true);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [selectedActorIds, setSelectedActorIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.fetchActors();
        if (!cancelled) {
          setActors(data.actors || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingActors(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const toggleActor = (actorId) => {
    setSelectedActorIds((current) =>
      current.includes(actorId)
        ? current.filter((id) => id !== actorId)
        : [...current, actorId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.addMovie({
        title,
        genre,
        releaseDate,
        actors: selectedActorIds
      });
      toast.success(data.message);
      navigate('/feed');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold text-zinc-100">Add Movie</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Adding a movie notifies every follower of its cast.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-400">Title *</label>
          <input
            type="text"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Next Big Thing"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-600 focus:outline-none"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Genre</label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Drama"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Release date *
            </label>
            <input
              type="date"
              value={releaseDate}
              required
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">Cast *</label>
          {loadingActors ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {actors.map((actor) => (
                <label
                  key={actor._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    selectedActorIds.includes(actor._id)
                      ? 'border-purple-700 bg-purple-950/40 text-purple-200'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedActorIds.includes(actor._id)}
                    onChange={() => toggleActor(actor._id)}
                    className="h-4 w-4 accent-purple-600"
                  />
                  {actor.name}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || selectedActorIds.length === 0}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Movie'}
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

export default AddMoviePage;
