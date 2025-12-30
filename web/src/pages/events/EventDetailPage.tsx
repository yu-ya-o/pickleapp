import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  Edit,
  Trash2,
  CircleDollarSign,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Avatar, Loading, Modal, GoogleMap } from '@/components/ui';
import {
  formatDateTime,
  getSkillLevelEmoji,
  getSkillLevelLabel,
  getDisplayName,
} from '@/lib/utils';
import type { Event } from '@/types';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEvent(id!);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!event) return;
    try {
      setIsActionLoading(true);
      await api.createReservation(event.id);
      await loadEvent();
    } catch (error) {
      console.error('Failed to join event:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!event) return;
    const reservation = event.reservations.find((r) => r.user.id === user?.id);
    if (!reservation) return;

    try {
      setIsActionLoading(true);
      await api.cancelReservation(reservation.id);
      await loadEvent();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await api.deleteEvent(event.id);
      navigate('/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">イベントが見つかりません</p>
      </div>
    );
  }

  const isCreator = event.creator.id === user?.id;
  const isJoined = event.isUserReserved;
  const isFull = event.availableSpots === 0;

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold">イベント詳細</h1>
          <div className="flex items-center gap-2">
            {isCreator && (
              <>
                <button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Event Info Card */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-bold">{event.title}</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="font-medium">{formatDateTime(event.startTime)}</p>
                  <p className="text-sm text-gray-400">
                    〜 {formatDateTime(event.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={20} />
                <div className="flex-1">
                  <p className="font-medium">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-gray-500">{event.address}</p>
                  )}
                  <p className="text-sm text-gray-400">{event.region}</p>
                </div>
              </div>

              {/* Google Map */}
              {event.latitude && event.longitude && (
                <div className="pt-2">
                  <GoogleMap
                    latitude={event.latitude}
                    longitude={event.longitude}
                    title={event.location}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-600">
                <Users size={20} />
                <p>
                  {event.maxParticipants - event.availableSpots} /{' '}
                  {event.maxParticipants} 人
                </p>
              </div>

              {event.price && (
                <div className="flex items-center gap-3 text-gray-600">
                  <CircleDollarSign size={20} />
                  <p>{event.price.toLocaleString()} 円</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getSkillLevelEmoji(event.skillLevel)}
                </span>
                <span className="font-medium">
                  {getSkillLevelLabel(event.skillLevel)}
                </span>
              </div>
            </div>

            {event.description && (
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Creator Card */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">主催者</h3>
            <Link
              to={`/users/${event.creator.id}`}
              className="flex items-center gap-3"
            >
              <Avatar
                src={event.creator.profileImage}
                alt={getDisplayName(event.creator)}
                size="lg"
              />
              <div>
                <p className="font-medium">{getDisplayName(event.creator)}</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Participants Card */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">
              参加者 ({event.reservations.length})
            </h3>
            {event.reservations.length === 0 ? (
              <p className="text-gray-400 text-sm">まだ参加者がいません</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {event.reservations.map((reservation) => (
                  <Link
                    key={reservation.id}
                    to={`/users/${reservation.user.id}`}
                    className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1"
                  >
                    <Avatar
                      src={reservation.user.profileImage}
                      alt={getDisplayName(reservation.user)}
                      size="sm"
                    />
                    <span className="text-sm">
                      {getDisplayName(reservation.user)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 lg:left-72 bg-white border-t border-[var(--border)] p-4 z-30">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/events/${event.id}/chat`)}
          >
            <MessageCircle size={18} className="mr-2" />
            チャット
          </Button>
          {!isCreator && (
            <Button
              className="flex-1"
              onClick={isJoined ? handleCancel : handleJoin}
              isLoading={isActionLoading}
              disabled={!isJoined && isFull}
              variant={isJoined ? 'secondary' : 'primary'}
            >
              {isJoined ? '参加をキャンセル' : isFull ? '満員' : '参加する'}
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="イベントを削除"
      >
        <p className="text-gray-600 mb-6">
          このイベントを削除しますか？この操作は取り消せません。
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowDeleteModal(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
          >
            削除する
          </Button>
        </div>
      </Modal>
    </div>
  );
}
