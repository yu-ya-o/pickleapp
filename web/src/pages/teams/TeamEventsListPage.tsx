import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';
import { Avatar, Loading } from '@/components/ui';
import { Breadcrumb } from '@/components/Breadcrumb';
import type { Team, TeamEvent } from '@/types';

export function TeamEventsListPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadData();
    }
  }, [teamId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teamData, eventsData] = await Promise.all([
        api.getTeam(teamId!),
        api.getTeamEvents(teamId!),
      ]);
      setTeam(teamData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const isAdmin = team?.userRole === 'admin' || team?.userRole === 'owner';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        {/* Breadcrumb */}
        <div style={{ padding: '12px 16px' }}>
          <Breadcrumb
            items={[
              { label: 'サークル', href: '/teams' },
              { label: team?.name || 'サークル', href: `/teams/${teamId}` },
              { label: 'イベント' }
            ]}
          />
        </div>
        <div className="flex items-center justify-between" style={{ padding: '0 16px 12px' }}>
          <h1 className="font-semibold text-lg">サークルイベント</h1>
          {isAdmin && (
            <button
              onClick={() => navigate(`/teams/${teamId}/events/create`)}
              className="text-[var(--primary)]"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Events List */}
      <div style={{ padding: '0' }}>
        {events.length === 0 ? (
          <p className="text-gray-400 text-sm text-center" style={{ padding: '40px 20px' }}>
            イベントがありません
          </p>
        ) : (
          events.map((event) => {
            const maxParticipants = event.maxParticipants ?? 0;
            const currentParticipants = maxParticipants - (event.availableSpots ?? maxParticipants);
            const isFull = (event.availableSpots ?? maxParticipants) === 0;

            return (
              <Link
                key={event.id}
                to={`/teams/${teamId}/events/${event.id}`}
                className="flex items-center gap-3 bg-white border-b border-gray-100"
                style={{ padding: '12px 16px' }}
              >
                {/* Team Icon */}
                <div className="flex flex-col items-center" style={{ width: '60px' }}>
                  <Avatar
                    src={team?.iconImage}
                    alt={team?.name || ''}
                    size="lg"
                  />
                  <span className="text-xs text-gray-400 truncate w-full text-center" style={{ marginTop: '4px' }}>
                    {team?.name?.slice(0, 4)}...
                  </span>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={14} />
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  <h3 className="font-medium text-base" style={{ marginTop: '4px' }}>
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm" style={{ marginTop: '4px' }}>
                    <MapPin size={14} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-4" style={{ marginTop: '4px' }}>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Users size={14} />
                      <span>{currentParticipants}/{event.maxParticipants}人</span>
                    </div>
                    {isFull && (
                      <span
                        className="text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: '#EF4444', padding: '2px 8px' }}
                      >
                        満席
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
