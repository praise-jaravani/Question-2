import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Check } from 'lucide-react';
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

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (notification) => {
    try {
      await api.markNotificationRead(notification._id);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold text-zinc-100">
        <Bell size={26} className="text-purple-400" />
        Notifications
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up.'}
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                notification.read
                  ? 'border-zinc-800 bg-zinc-950 text-zinc-500'
                  : 'border-purple-900 bg-zinc-950 text-zinc-100'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{notification.message}</p>
                <p className="mt-1 text-xs text-zinc-600">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => handleMarkRead(notification)}
                  className="ml-4 flex shrink-0 items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-purple-700 hover:text-purple-300"
                >
                  <Check size={14} />
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
