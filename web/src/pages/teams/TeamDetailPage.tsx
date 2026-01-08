import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  MessageCircle,
  Settings,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button, Card, CardContent, Avatar, Loading, Badge } from '@/components/ui';
import type { Team, TeamEvent } from '@/types';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const [teamData, eventsData] = await Promise.all([
        api.getTeam(id!),
        api.getTeamEvents(id!),
      ]);
      setTeam(teamData);
      setEvents(eventsData);
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
          <h1 className="font-semibold">チーム詳細</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate(`/teams/${team.id}/settings`)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Team Header */}
      <div className="bg-white border-b border-[var(--border)]">
        {team.headerImage && (
          <div className="h-32 md:h-48 bg-gray-200">
            <img
              src={team.headerImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <Avatar
              src={team.iconImage}
              alt={team.name}
              size="xl"
              className="-mt-8 border-4 border-white"
            />
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-xl font-bold break-words">{team.name}</h2>
                {team.visibility === 'private' && (
                  <Badge variant="default">非公開</Badge>
                )}
              </div>
              {team.region && (
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin size={14} />
                  <span>{team.region}</span>
                </div>
              )}
            </div>
          </div>
          {team.description && (
            <p className="mt-4 text-gray-600 break-words">{team.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Action Buttons */}
        {isMember ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/teams/${team.id}/chat`)}
            >
              <MessageCircle size={18} className="mr-2" />
              チャット
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/teams/${team.id}/members`)}
            >
              <Users size={18} className="mr-2" />
              メンバー
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={handleJoinRequest}
            isLoading={isActionLoading}
            disabled={team.hasPendingJoinRequest}
          >
            <UserPlus size={18} className="mr-2" />
            {team.hasPendingJoinRequest ? '申請中' : '参加をリクエスト'}
          </Button>
        )}

        {/* Team Events */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">チームイベント</h3>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/teams/${team.id}/events/create`)}
                >
                  作成
                </Button>
              )}
            </div>
            {events.length === 0 ? (
              <p className="text-gray-400 text-sm">イベントがありません</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <Link
                    key={event.id}
                    to={`/teams/${team.id}/events/${event.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Calendar size={20} className="text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2 break-words">{event.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.startTime).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </Link>
                ))}
                {events.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate(`/teams/${team.id}/events`)}
                  >
                    すべて見る ({events.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">メンバー ({team.memberCount})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/teams/${team.id}/members`)}
              >
                すべて見る
              </Button>
            </div>
            {team.members && team.members.length > 0 ? (
              <div className="flex -space-x-2">
                {team.members.slice(0, 8).map((member) => (
                  <Avatar
                    key={member.id}
                    src={member.user.profileImage}
                    alt={member.user.nickname || member.user.name}
                    size="md"
                    className="border-2 border-white"
                  />
                ))}
                {team.memberCount > 8 && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 border-2 border-white">
                    +{team.memberCount - 8}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">メンバーがいません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
