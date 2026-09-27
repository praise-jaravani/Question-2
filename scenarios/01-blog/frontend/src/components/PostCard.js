import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PostCard = ({ post }) => {
  return (
    <Link
      to={`/post/${post._id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-purple-700"
    >
      <div className="mb-3 flex items-center gap-3">
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
      <h2 className="mb-2 text-lg font-semibold text-zinc-100">{post.title}</h2>
      <p className="mb-4 line-clamp-2 text-sm text-zinc-400">{post.excerpt}</p>
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-300">{post.author?.name || 'Unknown'}</span>
          <span className="mx-2">·</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          {(post.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-zinc-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
