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
import { Avatar, Loading, Modal } from '@/components/ui';
import type { Team } from '@/types';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center text-[var(--primary)] font-medium"
          >
            <ChevronLeft size={24} />
            <span>チーム</span>
          </button>
          <h1 className="font-semibold text-lg absolute left-1/2 transform -translate-x-1/2">チーム</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* Header Image */}
      {team.headerImage && (
        <div style={{ height: '200px' }} className="bg-gray-200">
          <img
            src={team.headerImage}
            alt=""
            className="w-full h-full object-cover"
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
              <h2 className="text-xl font-bold break-words">{team.name}</h2>
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
              onClick={handleJoinRequest}
              disabled={isActionLoading || team.hasPendingJoinRequest}
              className="w-full flex items-center justify-center gap-2 text-white font-medium rounded-xl disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', padding: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <UserPlus size={20} />
              <span>{team.hasPendingJoinRequest ? '申請中' : '参加リクエスト'}</span>
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
    </div>
  );
}
