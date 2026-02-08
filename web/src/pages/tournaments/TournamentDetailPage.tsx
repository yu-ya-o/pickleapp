import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
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

  // SNS links for table display
  const snsText: string[] = [];
  if (tournament.snsUrls?.twitter) snsText.push('X (Twitter)');
  if (tournament.snsUrls?.instagram) snsText.push('Instagram');
  if (tournament.snsUrls?.line) snsText.push('LINE');

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
        {/* Title */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1a1a2e',
          lineHeight: 1.4,
          marginBottom: '16px',
        }}>
          {tournament.title}
        </h1>

        {/* Cover Image */}
        <div style={{
          marginBottom: '16px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {tournament.coverImage ? (
            <img
              src={tournament.coverImage}
              alt={tournament.title}
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '180px',
                maxHeight: '300px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 40%, #1e3a5f 70%, #4a9bd9 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative diagonal stripes */}
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '60%',
                height: '140%',
                background: 'linear-gradient(135deg, transparent 30%, rgba(74,155,217,0.3) 50%, transparent 70%)',
                transform: 'rotate(-15deg)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '40%',
                height: '80%',
                background: 'linear-gradient(135deg, rgba(100,200,255,0.2) 0%, transparent 60%)',
                transform: 'rotate(10deg)',
              }} />
              <span style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#FFFFFF',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '2px',
                zIndex: 1,
              }}>
                PICKLEBALL
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                zIndex: 1,
                marginTop: '4px',
              }}>
                TOURNAMENT
              </span>
            </div>
          )}
        </div>

        {/* 大会概要 Section */}
        <SectionHeader title="大会概要" />
        <div style={{
          background: '#FFFFFF',
          padding: '16px',
          marginBottom: '16px',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#333333', fontSize: '14px' }}>
            {tournament.description}
          </p>
        </div>

        {/* 基本情報 Section */}
        <SectionHeader title="基本情報" />
        <div style={{
          background: '#FFFFFF',
          marginBottom: '16px',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          <TableRow label="大会名" value={tournament.title} />
          <TableRow label="開催日" value={tournament.eventDate} />
          <TableRow label="主催" value={tournament.organizer} />
          <TableRow label="会場">
            <span>{tournament.venue}</span>
            {tournament.address && (
              <span style={{ display: 'block', fontSize: '13px', color: '#888888', marginTop: '2px' }}>
                ({tournament.address})
              </span>
            )}
          </TableRow>
          <TableRow label="種目" value={tournament.events} />
          <TableRow label="試合形式" value={tournament.matchFormat} />
          <TableRow label="申込期限" value={tournament.applicationDeadline} />
          <TableRow label="参加費用" value={tournament.entryFee} />
          <TableRow label="支払方法" value={tournament.paymentMethod} />
          <TableRow label="大会URL">
            {tournament.tournamentUrl ? (
              <a
                href={tournament.tournamentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1D9BF0', textDecoration: 'none', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {tournament.tournamentUrl}
                <ExternalLink size={12} />
              </a>
            ) : (
              <span style={{ color: '#CCCCCC' }}>-</span>
            )}
          </TableRow>
          <TableRow label="問合せ先" value={tournament.contactInfo || undefined} />
          <TableRow label="SNS" isLast>
            {snsText.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tournament.snsUrls?.twitter && (
                  <a href={tournament.snsUrls.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1D9BF0', textDecoration: 'none', fontSize: '14px' }}>
                    X (Twitter)
                  </a>
                )}
                {tournament.snsUrls?.instagram && (
                  <a href={tournament.snsUrls.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', textDecoration: 'none', fontSize: '14px' }}>
                    Instagram
                  </a>
                )}
                {tournament.snsUrls?.line && (
                  <a href={tournament.snsUrls.line} target="_blank" rel="noopener noreferrer" style={{ color: '#00B900', textDecoration: 'none', fontSize: '14px' }}>
                    LINE
                  </a>
                )}
              </div>
            ) : (
              <span style={{ color: '#CCCCCC' }}>-</span>
            )}
          </TableRow>
        </div>

        {/* Google Map */}
        {tournament.latitude && tournament.longitude && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <GoogleMap
              latitude={tournament.latitude}
              longitude={tournament.longitude}
              title={tournament.venue}
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${tournament.latitude},${tournament.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#65A30D', marginTop: '8px', textDecoration: 'none', fontSize: '14px' }}
            >
              Google Mapsで開く
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* 投稿者 Section */}
        <SectionHeader title="投稿者" />
        <div style={{
          background: '#FFFFFF',
          padding: '16px',
          marginBottom: '16px',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
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

        {/* Creator Actions */}
        {isCreator && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
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

/** セクションヘッダー（緑帯） */
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #65A30D 0%, #4d7c0f 100%)',
      padding: '10px 16px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px' }}>{title}</span>
    </div>
  );
}

/** テーブル行（ラベル + 値） */
function TableRow({
  label,
  value,
  children,
  isLast,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: isLast ? 'none' : '1px solid #E5E5E5',
      minHeight: '48px',
    }}>
      {/* Label */}
      <div style={{
        width: '100px',
        minWidth: '100px',
        background: '#F9FAFB',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #E5E5E5',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>{label}</span>
      </div>
      {/* Value */}
      <div style={{
        flex: 1,
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {children || (
          <span style={{ fontSize: '14px', color: '#333333', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {value || <span style={{ color: '#CCCCCC' }}>-</span>}
          </span>
        )}
      </div>
    </div>
  );
}
