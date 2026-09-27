import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const FollowingPage = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.fetchFollowing();
        if (!cancelled) {
          setFollowing(data.following || []);
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
      <h1 className="mb-1 text-3xl font-bold text-zinc-100">Following</h1>
      <p className="mb-6 text-sm text-zinc-500">Actors you follow.</p>

      {loading ? (
        <LoadingSpinner />
      ) : following.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          You aren't following anyone yet. Find actors on the home page.
        </p>
      ) : (
        <div className="space-y-3">
          {following.map((follow) => (
            <Link
              key={follow._id}
              to={follow.actor && follow.actor._id ? `/actor/${follow.actor._id}` : '/'}
              className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-semibold text-zinc-100 transition-colors hover:border-purple-700 hover:text-purple-300"
            >
              {follow.actor && follow.actor.name ? follow.actor.name : 'Unknown actor'}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingPage;
