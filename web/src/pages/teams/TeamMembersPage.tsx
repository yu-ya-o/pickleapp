import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Crown } from 'lucide-react';
import { api } from '@/services/api';
import { Avatar, Loading } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayName } from '@/lib/utils';
import type { Team } from '@/types';

export function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTeam(teamId!);
      setTeam(data);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[var(--primary)] font-medium"
          >
            <ChevronLeft size={24} />
            <span>前の画面に戻る</span>
          </button>
          <h1 className="font-semibold text-lg absolute left-1/2 transform -translate-x-1/2">
            メンバー ({team.memberCount})
          </h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* Members List */}
      <div style={{ padding: '16px' }}>
        <div className="bg-white rounded-xl overflow-hidden">
          {team.members && team.members.length > 0 ? (
            team.members.map((member, index) => {
              const isCurrentUser = member.user.id === user?.id;
              const isOwner = member.role === 'owner';

              return (
                <div key={member.id}>
                  <div
                    className="flex items-center gap-3"
                    style={{ padding: '12px 16px', cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${member.user.id}`)}
                  >
                    <Avatar
                      src={member.user.profileImage}
                      alt={getDisplayName(member.user)}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getDisplayName(member.user)}</span>
                        {isCurrentUser && (
                          <span className="text-gray-400 text-sm">（あなた）</span>
                        )}
                      </div>
                      {isOwner && (
                        <span className="text-gray-500 text-sm">Owner</span>
                      )}
                    </div>
                    {isOwner && (
                      <Crown size={20} className="text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  {index < team.members!.length - 1 && (
                    <div className="border-b border-gray-100" style={{ marginLeft: '76px' }} />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm text-center" style={{ padding: '20px' }}>
              メンバーがいません
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
