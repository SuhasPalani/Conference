// FILE: frontend/src/components/Notifications/NotificationItem.tsx
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { getTimeAgo } from '@/lib/utils';

interface NotificationItemProps {
  notification: any;
  onClose: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotifications();

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      role_request: '📝',
      role_approved: '✅',
      role_rejected: '❌',
      idea_submitted: '💡',
      idea_assigned: '🎯',
      idea_evaluated: '⭐',
      idea_status_changed: '🔄',
      evaluation_completed: '✅',
    };
    return icons[type] || '🔔';
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 transition-colors cursor-pointer relative
        ${notification.isRead 
          ? 'bg-transparent hover:bg-gray-800/30' 
          : 'bg-orange-900/10 hover:bg-orange-900/20'
        }
      `}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full" />
      )}

      <div className="flex items-start gap-3 ml-4">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-600">
            {getTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
          aria-label="Delete notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}