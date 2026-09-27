import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, UserPlus, UserMinus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const ActorDetailPage = () => {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const navigate = useNavigate();

  const loadActor = async () => {
    try {
      const data = await api.fetchActor(id);
      setActor(data.actor);
      setIsFollowing(Boolean(data.isFollowing));
    } catch (error) {
      toast.error(error.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFollow = async () => {
    setWorking(true);
    try {
      const data = await api.followActor(id);
      toast.success(data.message);
      loadActor();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  const handleUnfollow = async () => {
    setWorking(true);
    try {
      const data = await api.unfollowActor(id);
      toast.success(data.message);
      loadActor();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!actor) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <ArrowLeft size={16} />
        Back to actors
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">{actor.name}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-zinc-500">
              <Users size={14} />
              {actor.followerCount} follower{actor.followerCount === 1 ? '' : 's'}
            </p>
          </div>
          {isFollowing ? (
            <button
              onClick={handleUnfollow}
              disabled={working}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-800 hover:text-red-400 disabled:opacity-50"
            >
              <UserMinus size={16} />
              Unfollow
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={working}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
            >
              <UserPlus size={16} />
              Follow
            </button>
          )}
        </div>
        <p className="text-[15px] leading-7 text-zinc-300">{actor.bio}</p>
      </div>
    </div>
  );
};

export default ActorDetailPage;
