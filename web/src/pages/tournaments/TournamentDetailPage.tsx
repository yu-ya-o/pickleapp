import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  CreditCard,
  Wallet,
  Globe,
  Mail,
  Edit as EditIcon,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Loading, Modal, GoogleMap } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SEO } from '@/components/SEO';
import { getDisplayName } from '@/lib/utils';
import type { Tournament } from '@/types';

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadTournament();
    }
  }, [id]);

  const loadTournament = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getTournament(id!);
      setTournament(data);
    } catch (err) {
      console.error('Failed to load tournament:', err);
      setError(err instanceof Error ? err.message : '大会情報の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tournament) return;
    try {
      await api.deleteTournament(tournament.id);
      navigate('/tournaments');
    } catch (error) {
      console.error('Failed to delete tournament:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7', padding: '16px' }}>
        <Trophy size={56} style={{ color: '#DC2626', marginBottom: '16px' }} />
        <p style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>
          {error || '大会が見つかりません'}
        </p>
        <button
          onClick={() => navigate('/tournaments')}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          大会一覧に戻る
        </button>
      </div>
    );
  }

  const isCreator = tournament.creator.id === user?.id;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', overflowX: 'hidden' }}>
      <SEO
        title={`${tournament.title} | PickleHub`}
        description={tournament.description}
        keywords="ピックルボール, 大会, トーナメント, pickleball, tournament"
        url={`/tournaments/${tournament.id}`}
      />
      <PageHeader />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 16px', background: '#F5F5F7' }}>
        <Breadcrumb
          items={[
            { label: '大会', href: '/tournaments' },
            { label: tournament.title }
          ]}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px', paddingBottom: '200px' }}>
        {/* Card Container */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {/* Title */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Trophy size={24} style={{ color: '#65A30D' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#65A30D', background: '#F0FDF4', padding: '2px 8px', borderRadius: '4px' }}>大会</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>{tournament.title}</h1>
          </div>

          {/* Description */}
          {tournament.description && (
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#1a1a2e' }}>
                {tournament.description}
              </p>
            </div>
          )}

          {/* Basic Info */}
          <div style={{ padding: '16px', borderTop: '1px solid #E5E5E5' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1a1a2e', fontSize: '16px' }}>基本情報</h3>

            {/* Event Date */}
            <InfoRow icon={<Calendar size={20} style={{ color: '#65A30D' }} />} label="開催日" value={tournament.eventDate} />

            {/* Organizer */}
            <InfoRow icon={<Users size={20} style={{ color: '#65A30D' }} />} label="主催" value={tournament.organizer} />

            {/* Venue */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ minWidth: '20px', paddingTop: '2px' }}>
                <MapPin size={20} style={{ color: '#65A30D' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>会場</p>
                <p style={{ fontWeight: 500, color: '#1a1a2e' }}>{tournament.venue}</p>
                {tournament.address && (
                  <p style={{ fontSize: '14px', color: '#888888', marginTop: '2px' }}>{tournament.address}</p>
                )}
              </div>
            </div>

            {/* Google Map */}
            {tournament.latitude && tournament.longitude && (
              <div style={{ marginBottom: '12px', marginLeft: '32px' }}>
                <GoogleMap
                  latitude={tournament.latitude}
                  longitude={tournament.longitude}
                  title={tournament.venue}
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${tournament.latitude},${tournament.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#65A30D', marginTop: '8px', textDecoration: 'none', fontSize: '14px' }}
                >
                  <span>Google Mapsで開く</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Events/Sports */}
            <InfoRow icon={<Trophy size={20} style={{ color: '#65A30D' }} />} label="種目" value={tournament.events} />

            {/* Match Format */}
            <InfoRow icon={<Users size={20} style={{ color: '#65A30D' }} />} label="試合形式" value={tournament.matchFormat} />

            {/* Application Deadline */}
            <InfoRow icon={<Clock size={20} style={{ color: '#65A30D' }} />} label="申込期限" value={tournament.applicationDeadline} />

            {/* Entry Fee */}
            <InfoRow icon={<CreditCard size={20} style={{ color: '#65A30D' }} />} label="参加費用" value={tournament.entryFee} />

            {/* Payment Method */}
            <InfoRow icon={<Wallet size={20} style={{ color: '#65A30D' }} />} label="支払方法" value={tournament.paymentMethod} />

            {/* Tournament URL */}
            {tournament.tournamentUrl && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ minWidth: '20px', paddingTop: '2px' }}>
                  <Globe size={20} style={{ color: '#65A30D' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>大会URL</p>
                  <a
                    href={tournament.tournamentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1D9BF0', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {tournament.tournamentUrl}
                  </a>
                </div>
              </div>
            )}

            {/* Contact */}
            <InfoRow icon={<Mail size={20} style={{ color: '#65A30D' }} />} label="問合せ先" value={tournament.contactInfo} />

            {/* SNS */}
            {tournament.snsUrls && Object.values(tournament.snsUrls).some(Boolean) && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ minWidth: '20px', paddingTop: '2px' }}>
                  <Globe size={20} style={{ color: '#65A30D' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>SNS</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tournament.snsUrls.twitter && (
                      <a href={tournament.snsUrls.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1D9BF0', textDecoration: 'none', fontSize: '14px' }}>
                        X (Twitter)
                      </a>
                    )}
                    {tournament.snsUrls.instagram && (
                      <a href={tournament.snsUrls.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', textDecoration: 'none', fontSize: '14px' }}>
                        Instagram
                      </a>
                    )}
                    {tournament.snsUrls.line && (
                      <a href={tournament.snsUrls.line} target="_blank" rel="noopener noreferrer" style={{ color: '#00B900', textDecoration: 'none', fontSize: '14px' }}>
                        LINE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Creator Section */}
          <div style={{ padding: '16px', borderTop: '1px solid #E5E5E5' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>投稿者</h3>
            <Link
              to={`/users/${tournament.creator.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
            >
              <Avatar
                src={tournament.creator.profileImage}
                alt={getDisplayName(tournament.creator)}
                size="lg"
              />
              <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{getDisplayName(tournament.creator)}</span>
            </Link>
          </div>
        </div>

        {/* Creator Actions */}
        {isCreator && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
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
                color: '#65A30D',
                padding: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <EditIcon size={18} />
              <span>大会情報を編集</span>
            </button>

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
              大会を削除
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="大会を削除"
      >
        <p className="text-gray-600 mb-6">
          この大会を削除しますか？この操作は取り消せません。
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
      <div style={{ minWidth: '20px', paddingTop: '2px' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontWeight: 500, color: '#1a1a2e', whiteSpace: 'pre-wrap' }}>{value}</p>
      </div>
    </div>
  );
}
