import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Calendar,
  Users,
  MessageCircle,
  Check,
  Trash2,
} from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'event_joined':
    case 'event_cancelled':
    case 'event_updated':
    case 'event_cancelled_by_creator':
    case 'event_reminder':
      return Calendar;
    case 'team_join_request':
    case 'team_member_left':
    case 'team_join_approved':
    case 'team_join_rejected':
    case 'team_role_changed':
    case 'team_event_created':
      return Users;
    case 'event_chat_message':
    case 'team_chat_message':
      return MessageCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'event_joined':
    case 'team_join_approved':
      return 'text-[var(--success)] bg-green-100';
    case 'event_cancelled':
    case 'event_cancelled_by_creator':
    case 'team_member_left':
    case 'team_join_rejected':
      return 'text-[var(--destructive)] bg-red-100';
    case 'event_chat_message':
    case 'team_chat_message':
      return 'text-[var(--primary)] bg-[var(--primary-light)]';
    default:
      return 'text-[var(--muted-foreground)] bg-[var(--muted)]';
  }
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.relatedId) {
      switch (notification.type) {
        case 'event_joined':
        case 'event_cancelled':
        case 'event_updated':
        case 'event_cancelled_by_creator':
        case 'event_reminder':
          navigate(`/events/${notification.relatedId}`);
          break;
        case 'event_chat_message':
          navigate(`/events/${notification.relatedId}/chat`);
          break;
        case 'team_join_request':
        case 'team_member_left':
        case 'team_join_approved':
        case 'team_join_rejected':
        case 'team_role_changed':
        case 'team_event_created':
          navigate(`/teams/${notification.relatedId}`);
          break;
        case 'team_chat_message':
          navigate(`/teams/${notification.relatedId}/chat`);
          break;
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
          <h1 className="text-lg font-semibold">通知</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1.5"
            >
              <Check size={16} />
              すべて既読
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28">
            <BellOff size={72} className="text-[var(--muted-foreground)] mb-5" />
            <h3 className="text-lg font-semibold text-[var(--muted-foreground)]">
              通知はありません
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              新しい通知があるとここに表示されます
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)] bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);

              return (
                <li
                  key={notification.id}
                  className={cn(
                    'cursor-pointer hover:bg-[var(--muted)] transition-colors',
                    !notification.isRead && 'bg-[var(--primary-light)]/30'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4 px-5 py-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0',
                        colorClass
                      )}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--foreground)] break-words">
                        {notification.title}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-2.5 hover:bg-[var(--muted)] rounded-full transition-colors"
                    >
                      <Trash2 size={18} className="text-[var(--muted-foreground)]" />
                    </button>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] flex-shrink-0 mt-2" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
