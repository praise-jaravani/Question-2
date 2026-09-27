import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Pencil, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.fetchPost(id);
        if (!cancelled) {
          setPost(data.post);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message);
          navigate('/');
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

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const data = await api.deletePost(post._id);
      toast.success(data.message);
      navigate('/my-posts');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return null;
  }

  const isAuthor = user && post.author && user._id === post.author._id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <ArrowLeft size={16} />
        Back to all posts
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full bg-purple-950 px-3 py-1 text-xs font-medium text-purple-300">
          {post.category}
        </span>
        {post.published === false && (
          <span className="rounded-full bg-amber-950 px-3 py-1 text-xs font-medium text-amber-300">
            Draft
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Clock size={12} />
          {post.readTime} min read
        </span>
      </div>

      <h1 className="mb-4 text-4xl font-bold leading-tight text-zinc-100">{post.title}</h1>

      <div className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <p className="font-medium text-zinc-200">{post.author?.name}</p>
          <p className="text-xs text-zinc-500">
            {post.author?.bio ? `${post.author.bio} · ` : ''}
            {formatDate(post.createdAt)}
          </p>
        </div>
        {isAuthor && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/edit/${post._id}`)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-purple-700 hover:text-purple-300"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-red-800 hover:text-red-400"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <article className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-300">
        {post.content}
      </article>

      {(post.tags || []).length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
