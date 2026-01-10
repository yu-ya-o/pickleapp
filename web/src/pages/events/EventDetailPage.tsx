import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  Edit,
  Copy,
  Lock,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Loading, Modal, GoogleMap } from '@/components/ui';
import {
  formatDateTime,
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
  const [showCloseModal, setShowCloseModal] = useState(false);

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

  const handleCloseEvent = async () => {
    if (!event) return;
    try {
      setIsActionLoading(true);
      await api.updateEvent(event.id, { status: 'completed' });
      setShowCloseModal(false);
      await loadEvent();
    } catch (error) {
      console.error('Failed to close event:', error);
    } finally {
      setIsActionLoading(false);
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
  const currentParticipants = event.maxParticipants - event.availableSpots;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[var(--primary)] font-medium"
          >
            <ChevronLeft size={24} />
            <span>Back</span>
          </button>
          <h1 className="font-semibold text-lg absolute left-1/2 transform -translate-x-1/2">イベント</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* Content */}
      <div style={{ paddingBottom: '200px' }}>
        {/* Event Title & Level */}
        <div style={{ padding: '16px' }}>
          <h2 className="text-2xl font-bold">{event.title}</h2>
          <p className="text-gray-500" style={{ marginTop: '4px' }}>
            {getSkillLevelLabel(event.skillLevel)}
          </p>
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ padding: '0 16px 16px' }}>
            <p className="whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {/* Event Info */}
        <div className="border-t border-[var(--border)]" style={{ padding: '16px' }}>
          {/* Date/Time */}
          <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
            <Calendar size={20} className="text-gray-400" />
            <span>{formatDateTime(event.startTime)} 〜 {formatDateTime(event.endTime).split(' ')[1]}</span>
          </div>

          {/* Region */}
          <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
            <MapPin size={20} className="text-gray-400" />
            <span>{event.region}</span>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3" style={{ marginBottom: '12px' }}>
            <div className="rounded-full bg-gray-200 flex items-center justify-center" style={{ width: '20px', height: '20px', minWidth: '20px' }}>
              <span className="text-xs">ⓘ</span>
            </div>
            <div>
              <p className="font-medium">{event.location}</p>
              {event.address && (
                <p className="text-sm text-gray-500">{event.address}</p>
              )}
            </div>
          </div>

          {/* Google Map */}
          {event.latitude && event.longitude && (
            <div style={{ marginBottom: '12px' }}>
              <GoogleMap
                latitude={event.latitude}
                longitude={event.longitude}
                title={event.location}
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--primary)]"
                style={{ marginTop: '8px' }}
              >
                <span>📍</span>
                <span>タップしてGoogle Mapsで開く</span>
              </a>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
            <Users size={20} className="text-gray-400" />
            <span className="text-[var(--primary)] font-medium">
              {currentParticipants}/{event.maxParticipants}人
            </span>
          </div>

          {/* Price */}
          {event.price !== undefined && event.price !== null && (
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-gray-400 flex items-center justify-center" style={{ width: '20px', height: '20px' }}>
                <span className="text-xs">¥</span>
              </div>
              <span>¥{event.price.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Organizer Section */}
        <div className="border-t border-[var(--border)]" style={{ padding: '16px' }}>
          <h3 className="font-bold" style={{ marginBottom: '12px' }}>主催</h3>
          <Link
            to={`/users/${event.creator.id}`}
            className="flex items-center gap-3"
          >
            <Avatar
              src={event.creator.profileImage}
              alt={getDisplayName(event.creator)}
              size="lg"
            />
            <span className="font-medium">{getDisplayName(event.creator)}</span>
          </Link>
        </div>

        {/* Participants Section */}
        <div className="border-t border-[var(--border)]" style={{ padding: '16px' }}>
          <h3 className="font-bold" style={{ marginBottom: '12px' }}>
            参加者 ({event.reservations.length})
          </h3>
          {event.reservations.length === 0 ? (
            <p className="text-gray-400 text-sm">まだ参加者がいません</p>
          ) : (
            <div className="space-y-3">
              {event.reservations.map((reservation) => (
                <Link
                  key={reservation.id}
                  to={`/users/${reservation.user.id}`}
                  className="flex items-center gap-3"
                >
                  <Avatar
                    src={reservation.user.profileImage}
                    alt={getDisplayName(reservation.user)}
                    size="md"
                  />
                  <span>{getDisplayName(reservation.user)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[var(--border)]" style={{ padding: '16px' }}>
          <div className="space-y-3">
            {/* Chat Button */}
            <button
              onClick={() => navigate(`/events/${event.id}/chat`)}
              className="w-full flex items-center justify-center gap-2 text-white font-medium rounded-xl"
              style={{ backgroundColor: 'var(--primary)', padding: '14px' }}
            >
              <MessageCircle size={20} />
              <span>チャットを開く</span>
            </button>

            {/* Join/Cancel Button */}
            {!isCreator && (
              <button
                onClick={isJoined ? handleCancel : handleJoin}
                disabled={isActionLoading || (!isJoined && isFull)}
                className="w-full font-medium rounded-xl disabled:opacity-50"
                style={{
                  backgroundColor: isJoined ? '#FEE2E2' : '#DBEAFE',
                  color: isJoined ? '#DC2626' : 'var(--primary)',
                  padding: '14px',
                }}
              >
                {isActionLoading ? '処理中...' : isJoined ? '参加をキャンセル' : isFull ? '満員' : '参加する'}
              </button>
            )}

            {/* Creator Actions */}
            {isCreator && (
              <>
                {/* Cancel participation for creator */}
                {isJoined && (
                  <button
                    onClick={handleCancel}
                    disabled={isActionLoading}
                    className="w-full font-medium rounded-xl"
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '14px' }}
                  >
                    参加をキャンセル
                  </button>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 font-medium rounded-xl"
                  style={{ backgroundColor: '#DBEAFE', color: 'var(--primary)', padding: '14px' }}
                >
                  <Edit size={18} />
                  <span>イベントを編集</span>
                </button>

                {/* Duplicate Button */}
                <button
                  onClick={() => navigate(`/events/create?duplicate=${event.id}`)}
                  className="w-full flex items-center justify-center gap-2 font-medium rounded-xl"
                  style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '14px' }}
                >
                  <Copy size={18} />
                  <span>イベントを複製</span>
                </button>

                {/* Close Event Button */}
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="w-full flex items-center justify-center gap-2 font-medium rounded-xl"
                  style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '14px' }}
                >
                  <Lock size={18} />
                  <span>イベントを締め切る</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full font-medium rounded-xl"
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '14px' }}
                >
                  イベントを削除
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Close Event Confirmation Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="イベントを締め切る"
      >
        <p className="text-gray-600 mb-6">
          このイベントの募集を締め切りますか？
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 font-medium rounded-xl"
            style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '14px' }}
            onClick={() => setShowCloseModal(false)}
          >
            キャンセル
          </button>
          <button
            className="flex-1 font-medium rounded-xl"
            style={{ backgroundColor: '#D97706', color: 'white', padding: '14px' }}
            onClick={handleCloseEvent}
            disabled={isActionLoading}
          >
            {isActionLoading ? '処理中...' : '締め切る'}
          </button>
        </div>
      </Modal>

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
          <button
            className="flex-1 font-medium rounded-xl"
            style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '14px' }}
            onClick={() => setShowDeleteModal(false)}
          >
            キャンセル
          </button>
          <button
            className="flex-1 font-medium rounded-xl"
            style={{ backgroundColor: '#DC2626', color: 'white', padding: '14px' }}
            onClick={handleDelete}
          >
            削除する
          </button>
        </div>
      </Modal>
    </div>
  );
}
