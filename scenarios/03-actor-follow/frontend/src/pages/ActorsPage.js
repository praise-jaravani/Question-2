import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const ActorsPage = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h1 className="mb-1 text-3xl font-bold text-zinc-100">Actors</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Follow your favourites and never miss a release.
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : actors.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">No actors found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {actors.map((actor) => (
            <Link
              key={actor._id}
              to={`/actor/${actor._id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-purple-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">{actor.name}</h2>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Users size={12} />
                  {actor.followerCount} follower{actor.followerCount === 1 ? '' : 's'}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-zinc-400">{actor.bio}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActorsPage;
