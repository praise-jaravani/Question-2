import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PenSquare, Pencil, Trash2, Clock } from 'lucide-react';
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

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.fetchMyPosts();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const data = await api.deletePost(post._id);
      toast.success(data.message);
      loadPosts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">My Posts</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your published posts and drafts.</p>
        </div>
        <Link
          to="/create"
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <PenSquare size={16} />
          Write New Post
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          You haven't written any posts yet.
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-purple-950 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                    {post.category}
                  </span>
                  {post.published === false && (
                    <span className="rounded-full bg-amber-950 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                      Draft
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={12} />
                    {post.readTime} min
                  </span>
                </div>
                <Link
                  to={`/post/${post._id}`}
                  className="block truncate font-semibold text-zinc-100 hover:text-purple-300"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-zinc-500">{formatDate(post.createdAt)}</p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <button
                  onClick={() => navigate(`/edit/${post._id}`)}
                  className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-purple-700 hover:text-purple-300"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(post)}
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

export default MyPostsPage;
