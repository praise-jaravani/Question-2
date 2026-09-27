import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, Film } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const FeedPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.fetchFeed();
        if (!cancelled) {
          setMovies(data.movies || []);
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold text-zinc-100">Your Feed</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Movies featuring the actors you follow, newest first.
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : movies.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          Nothing here yet. Follow some actors to fill your feed.
        </p>
      ) : (
        <div className="space-y-3">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
                  <Film size={18} className="text-purple-400" />
                  {movie.title}
                </h2>
                {movie.genre && (
                  <span className="rounded-full bg-purple-950 px-3 py-1 text-xs font-medium text-purple-300">
                    {movie.genre}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {(movie.actors || [])
                    .map((actor) => actor.name || 'Unknown')
                    .join(', ')}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} />
                  {formatDate(movie.releaseDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
