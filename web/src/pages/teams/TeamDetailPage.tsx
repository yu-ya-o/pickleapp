import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  MessageCircle,
  UserPlus,
  Edit,
  Crown,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Loading, Modal } from '@/components/ui';
import { SEO } from '@/components/SEO';
import { generateTeamMeta, generateTeamJsonLd, generateTeamBreadcrumb } from '@/lib/seo';
import type { Team } from '@/types';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const teamData = await api.getTeam(id!);
      setTeam(teamData);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!team) return;
    try {
      setIsActionLoading(true);
      await api.requestToJoin(team.id);
      await loadTeam();
    } catch (error) {
      console.error('Failed to request to join:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    try {
      await api.deleteTeam(team.id);
      navigate('/teams');
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team || !user) return;
    try {
      setIsActionLoading(true);
      await api.removeMember(team.id, user.id);
      navigate('/teams');
    } catch (error) {
      console.error('Failed to leave team:', error);
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

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">チームが見つかりません</p>
      </div>
    );
  }

  const isOwner = team.userRole === 'owner';
  const isAdmin = team.userRole === 'admin' || isOwner;
  const isMember = team.isUserMember;

  const seoMeta = generateTeamMeta(team);
  const seoJsonLd = generateTeamJsonLd(team);
  const seoBreadcrumb = generateTeamBreadcrumb(team.name, team.id);

  // Menu item component
  const MenuItem = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-white rounded-xl"
      style={{ padding: '14px 16px' }}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-gray-500" />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <SEO
        title={seoMeta.title}
        description={seoMeta.description}
        keywords="ピックルボール, チーム, pickleball, チーム募集, メンバー募集"
        image={team.iconImage}
        url={`/teams/${team.id}`}
        jsonLd={[seoJsonLd, seoBreadcrumb]}
      />
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center text-[var(--primary)] font-medium"
          >
            <ChevronLeft size={24} />
            <span>前の画面に戻る</span>
          </button>
          <span className="font-semibold text-lg absolute left-1/2 transform -translate-x-1/2">チーム</span>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* Header Image */}
      {team.headerImage && (
        <div style={{ height: '200px' }} className="bg-gray-200">
          <img
            src={team.headerImage}
            alt={`${team.name}のヘッダー画像`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Team Info Section */}
      <div className="bg-white border-b border-[var(--border)]" style={{ padding: '16px' }}>
        <div className="flex items-start gap-4">
          <Avatar
            src={team.iconImage}
            alt={team.name}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold break-words">{team.name}</h1>
              {isOwner && <Crown size={20} className="text-yellow-500 flex-shrink-0" />}
            </div>
            {team.description && (
              <p className="text-gray-600 whitespace-pre-wrap break-words" style={{ marginTop: '8px' }}>
                {team.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-gray-500 text-sm" style={{ marginTop: '12px' }}>
              <Users size={16} />
              <span>{team.memberCount}人</span>
              <span>・</span>
              <span>{team.visibility === 'private' ? '非公開' : '公開'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {/* Menu Items for Members */}
        {isMember ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <MenuItem
              icon={Users}
              label="メンバーを見る"
              onClick={() => navigate(`/teams/${team.id}/members`)}
            />
            <MenuItem
              icon={Calendar}
              label="チームイベント"
              onClick={() => navigate(`/teams/${team.id}/events`)}
            />
            <MenuItem
              icon={MessageCircle}
              label="チームチャット"
              onClick={() => navigate(`/teams/${team.id}/chat`)}
            />
            {isAdmin && (
              <>
                <MenuItem
                  icon={UserPlus}
                  label="参加リクエスト管理"
                  onClick={() => navigate(`/teams/${team.id}/requests`)}
                />
                <MenuItem
                  icon={Edit}
                  label="チームを編集"
                  onClick={() => navigate(`/teams/${team.id}/edit`)}
                />
              </>
            )}
            {!isOwner && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="w-full font-medium rounded-xl"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '14px', marginTop: '8px' }}
              >
                チームを退出
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full font-medium rounded-xl"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '14px', marginTop: '8px' }}
              >
                チームを削除
              </button>
            )}
          </div>
        ) : (
          /* Non-member view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <MenuItem
              icon={Users}
              label="メンバーを見る"
              onClick={() => navigate(`/teams/${team.id}/members`)}
            />
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginModal(true);
                } else {
                  setShowJoinRequestModal(true);
                }
              }}
              disabled={isActionLoading || (isAuthenticated && team.hasPendingJoinRequest)}
              className="w-full flex items-center justify-center gap-2 text-white font-medium rounded-xl disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', padding: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <UserPlus size={20} />
              <span>{isAuthenticated && team.hasPendingJoinRequest ? '申請中' : '参加リクエスト'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="チームを削除"
      >
        <p className="text-gray-600 mb-6">
          このチームを削除しますか？この操作は取り消せません。
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
            onClick={handleDeleteTeam}
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
          チームに参加リクエストを送るにはログインしてください。
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

      {/* Join Request Confirmation Modal */}
      <Modal
        isOpen={showJoinRequestModal}
        onClose={() => setShowJoinRequestModal(false)}
        title="参加リクエスト"
      >
        <p style={{ color: '#666666', marginBottom: '24px' }}>
          このチームに参加リクエストを送信しますか？
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
            onClick={() => setShowJoinRequestModal(false)}
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
              backgroundColor: '#16A34A',
              color: 'white',
              padding: '14px'
            }}
            onClick={() => {
              setShowJoinRequestModal(false);
              handleJoinRequest();
            }}
            disabled={isActionLoading}
          >
            {isActionLoading ? '処理中...' : '送信する'}
          </button>
        </div>
      </Modal>

      {/* Leave Team Confirmation Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="チームを退出"
      >
        <p style={{ color: '#666666', marginBottom: '24px' }}>
          このチームから退出しますか？
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
            onClick={() => setShowLeaveModal(false)}
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
              backgroundColor: '#DC2626',
              color: 'white',
              padding: '14px'
            }}
            onClick={() => {
              setShowLeaveModal(false);
              handleLeaveTeam();
            }}
            disabled={isActionLoading}
          >
            {isActionLoading ? '処理中...' : '退出する'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
