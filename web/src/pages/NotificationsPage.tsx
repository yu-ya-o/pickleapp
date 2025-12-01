import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Users,
  MessageCircle,
  Check,
  Trash2,
} from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardContent, Loading, Button } from '@/components/ui';
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
      return 'text-green-500 bg-green-100';
    case 'event_cancelled':
    case 'event_cancelled_by_creator':
    case 'team_member_left':
    case 'team_join_rejected':
      return 'text-red-500 bg-red-100';
    case 'event_chat_message':
    case 'team_chat_message':
      return 'text-blue-500 bg-blue-100';
    default:
      return 'text-gray-500 bg-gray-100';
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
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">通知</h1>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={handleMarkAllAsRead}>
                <Check size={16} className="mr-1" />
                すべて既読
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">通知がありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-shadow',
                    !notification.isRead && 'bg-blue-50/50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          colorClass
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Trash2 size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
