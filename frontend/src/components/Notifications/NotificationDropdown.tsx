// FILE: frontend/src/components/Notifications/NotificationDropdown.tsx
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, isLoading, fetchNotifications, markAllAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="absolute right-0 mt-2 w-96 glass-morphism rounded-xl shadow-2xl border border-gray-700 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close notifications"
          >
            ✕
          </button>
        </div>

        {unreadNotifications.length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-gray-400">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}