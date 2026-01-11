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
  Menu,
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
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => navigate('/events')}
            style={{
              background: '#F0F0F0',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={20} style={{ color: '#1a1a2e' }} />
          </button>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#1a1a2e'
          }}>
            PickleHub
          </h1>
          <div style={{ width: '36px' }} />
        </div>
      </header>

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#1a1a2e',
          fontSize: '14px'
        }}
      >
        <ChevronLeft size={20} style={{ color: '#1a1a2e' }} />
        <span>前の画面に戻る</span>
      </button>

      {/* Content */}
      <div style={{ padding: '0 16px', paddingBottom: '200px' }}>
        {/* Card Container */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {/* Event Title & Level */}
          <div style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>{event.title}</h2>
            <p style={{ marginTop: '4px', color: '#888888' }}>
              {getSkillLevelLabel(event.skillLevel)}
            </p>
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#1a1a2e' }}>
                {event.description}
              </p>
            </div>
          )}

          {/* Event Info */}
          <div style={{ padding: '16px', borderTop: '1px solid #E5E5E5' }}>
            {/* Date/Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Calendar size={20} style={{ color: '#667eea' }} />
              <span style={{ color: '#1a1a2e' }}>{formatDateTime(event.startTime)} 〜 {formatDateTime(event.endTime).split(' ')[1]}</span>
            </div>

            {/* Region */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <MapPin size={20} style={{ color: '#667eea' }} />
              <span style={{ color: '#1a1a2e' }}>{event.region}</span>
            </div>

            {/* Venue */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '20px', height: '20px', minWidth: '20px', borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px' }}>ⓘ</span>
              </div>
              <div>
                <p style={{ fontWeight: 500, color: '#1a1a2e' }}>{event.location}</p>
                {event.address && (
                  <p style={{ fontSize: '14px', color: '#888888' }}>{event.address}</p>
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
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667eea', marginTop: '8px', textDecoration: 'none' }}
                >
                  <span>📍</span>
                  <span>タップしてGoogle Mapsで開く</span>
                </a>
              </div>
            )}

            {/* Participants */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Users size={20} style={{ color: '#667eea' }} />
              <span style={{ color: '#667eea', fontWeight: 500 }}>
                {currentParticipants}/{event.maxParticipants}人
              </span>
            </div>

            {/* Price */}
            {event.price !== undefined && event.price !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #888888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px' }}>¥</span>
                </div>
                <span style={{ color: '#1a1a2e' }}>¥{event.price.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Organizer Section */}
          <div style={{ padding: '16px', borderTop: '1px solid #E5E5E5' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>主催</h3>
            <Link
              to={`/users/${event.creator.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
            >
              <Avatar
                src={event.creator.profileImage}
                alt={getDisplayName(event.creator)}
                size="lg"
              />
              <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{getDisplayName(event.creator)}</span>
            </Link>
          </div>

          {/* Participants Section */}
          <div style={{ padding: '16px', borderTop: '1px solid #E5E5E5' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
              参加者 ({event.reservations.length})
            </h3>
            {event.reservations.length === 0 ? (
              <p style={{ color: '#888888', fontSize: '14px' }}>まだ参加者がいません</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.reservations.map((reservation) => (
                  <Link
                    key={reservation.id}
                    to={`/users/${reservation.user.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
                  >
                    <Avatar
                      src={reservation.user.profileImage}
                      alt={getDisplayName(reservation.user)}
                      size="md"
                    />
                    <span style={{ color: '#1a1a2e' }}>{getDisplayName(reservation.user)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {/* 未ログイン時は参加ボタンのみ表示 */}
          {!isAuthenticated ? (
            <button
              onClick={() => setShowLoginModal(true)}
              disabled={isFull}
              style={{
                width: '100%',
                fontWeight: 500,
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#FFFFFF',
                padding: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: isFull ? 0.5 : 1
              }}
            >
              {isFull ? '満員' : '参加する'}
            </button>
          ) : (
            <>
              {/* Chat Button */}
              <button
                onClick={() => navigate(`/events/${event.id}/chat`)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <MessageCircle size={20} />
                <span>チャットを開く</span>
              </button>

              {/* Join/Cancel Button */}
              {!isCreator && (
                <button
                  onClick={isJoined ? handleCancel : handleJoin}
                  disabled={isActionLoading || (!isJoined && isFull)}
                  style={{
                    width: '100%',
                    fontWeight: 500,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isJoined ? '#FEE2E2' : '#DBEAFE',
                    color: isJoined ? '#DC2626' : '#667eea',
                    padding: '14px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    opacity: (isActionLoading || (!isJoined && isFull)) ? 0.5 : 1
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
                      style={{
                        width: '100%',
                        fontWeight: 500,
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        padding: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      参加をキャンセル
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 500,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#DBEAFE',
                      color: '#667eea',
                      padding: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Edit size={18} />
                    <span>イベントを編集</span>
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={() => navigate(`/events/create?duplicate=${event.id}`)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 500,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      padding: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Copy size={18} />
                    <span>イベントを複製</span>
                  </button>

                  {/* Close Event Button */}
                  <button
                    onClick={() => setShowCloseModal(true)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 500,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      padding: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Lock size={18} />
                    <span>イベントを締め切る</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      width: '100%',
                      fontWeight: 500,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      padding: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    イベントを削除
                  </button>
                </>
              )}
            </>
          )}
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

      {/* Login Required Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="ログインが必要です"
      >
        <p style={{ color: '#666666', marginBottom: '24px' }}>
          イベントに参加するにはログインしてください。
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              flex: 1,
              fontWeight: 500,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              padding: '14px'
            }}
            onClick={() => setShowLoginModal(false)}
          >
            キャンセル
          </button>
          <button
            style={{
              flex: 1,
              fontWeight: 500,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '14px'
            }}
            onClick={() => navigate('/login')}
          >
            ログイン
          </button>
        </div>
      </Modal>
    </div>
  );
}
