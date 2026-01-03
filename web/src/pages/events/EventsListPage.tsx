import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, Search } from 'lucide-react';
import { api } from '@/services/api';
import { Loading, Avatar } from '@/components/ui';
import { formatDateTime, getDisplayName } from '@/lib/utils';
import { PREFECTURES } from '@/lib/prefectures';
import { cn } from '@/lib/utils';
import type { Event, TeamEvent } from '@/types';

type SegmentType = 'public' | 'team';

export function EventsListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([]);
  const [publicTeamEvents, setPublicTeamEvents] = useState<TeamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [segment, setSegment] = useState<SegmentType>('public');

  useEffect(() => {
    loadEvents();
  }, [selectedRegion, segment]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      if (segment === 'public') {
        const [eventsData, publicTeamEventsData] = await Promise.all([
          api.getEvents({
            status: 'active',
            upcoming: true,
            region: selectedRegion || undefined,
          }),
          api.getPublicTeamEvents(true),
        ]);
        setEvents(eventsData);
        setPublicTeamEvents(publicTeamEventsData);
      } else {
        const data = await api.getMyTeamEvents(true);
        setTeamEvents(data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  const filteredPublicTeamEvents = publicTeamEvents.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  const filteredTeamEvents = teamEvents.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  const allPublicEvents = [...filteredEvents, ...filteredPublicTeamEvents].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-2xl font-black italic text-center py-3">PickleHub</h1>

          {/* Segment Control */}
          <div className="px-4 pb-3">
            <div className="flex bg-[var(--muted)] rounded-lg p-1">
              <button
                onClick={() => setSegment('public')}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                  segment === 'public'
                    ? 'bg-white shadow-sm text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]'
                )}
              >
                公開イベント
              </button>
              <button
                onClick={() => setSegment('team')}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                  segment === 'team'
                    ? 'bg-white shadow-sm text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]'
                )}
              >
                マイチームイベント
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 px-4 pb-3">
            {/* Region Filter */}
            <div className="flex items-center gap-1 px-3 py-2 bg-[var(--muted)] rounded-lg min-w-[120px]">
              <MapPin size={14} className="text-[var(--muted-foreground)] flex-shrink-0" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent border-0 p-0 text-sm outline-none cursor-pointer text-[var(--primary)]"
              >
                <option value="">全て</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--muted)] rounded-lg">
              <Search size={14} className="text-[var(--muted-foreground)] flex-shrink-0" />
              <input
                type="text"
                placeholder="イベントを検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-[var(--muted-foreground)]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-20">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading size="lg" />
          </div>
        ) : segment === 'public' ? (
          allPublicEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="mx-auto text-[var(--muted-foreground)]" size={48} />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">
                イベントが見つかりません
              </h3>
              <p className="text-[var(--muted-foreground)]">最初のイベントを作成しましょう！</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {allPublicEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          )
        ) : filteredTeamEvents.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto text-[var(--muted-foreground)]" size={48} />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">
              チームイベントが見つかりません
            </h3>
            <p className="text-[var(--muted-foreground)]">
              チームに参加してイベントを確認しましょう
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filteredTeamEvents.map((event) => (
              <TeamEventRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/events/create')}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

function EventRow({ event }: { event: Event | TeamEvent }) {
  const isTeamEvent = 'team' in event;
  const linkTo = isTeamEvent
    ? `/teams/${(event as TeamEvent).team.id}`
    : `/events/${event.id}`;

  const displayImage = isTeamEvent
    ? (event as TeamEvent).creator.profileImage
    : event.creator.profileImage;
  const displayName = isTeamEvent
    ? (event as TeamEvent).team.name
    : getDisplayName(event.creator);

  const maxParticipants = event.maxParticipants ?? 0;
  const availableSpots = event.availableSpots ?? 0;

  return (
    <li>
      <Link
        to={linkTo}
        className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
          <Avatar src={displayImage} alt={displayName} size="lg" />
          <span className="text-[10px] text-[var(--muted-foreground)] truncate w-full text-center">
            {displayName}
          </span>
        </div>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          {/* Date */}
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <Calendar size={12} className="text-[var(--primary)]" />
            <span>{formatDateTime(event.startTime)}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[var(--foreground)] mt-0.5 truncate">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-0.5">
            <MapPin size={12} className="text-[var(--primary)]" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* Participants */}
          {maxParticipants > 0 && (
            <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-0.5">
              <Users size={12} className="text-[var(--primary)]" />
              <span>
                {maxParticipants - availableSpots}/{maxParticipants}人
              </span>

              {/* Status badge */}
              {availableSpots === 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                  満席
                </span>
              )}
              {availableSpots > 0 && availableSpots <= 3 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-orange-500 rounded-full">
                  残り{availableSpots}席
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

function TeamEventRow({ event }: { event: TeamEvent }) {
  const maxParticipants = event.maxParticipants ?? 0;
  const availableSpots = event.availableSpots ?? 0;

  return (
    <li>
      <Link
        to={`/teams/${event.team.id}`}
        className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
          <Avatar src={event.creator.profileImage} alt={event.team.name} size="lg" />
          <span className="text-[10px] text-[var(--muted-foreground)] truncate w-full text-center">
            {event.team.name}
          </span>
        </div>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          {/* Date */}
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <Calendar size={12} className="text-[var(--primary)]" />
            <span>{formatDateTime(event.startTime)}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[var(--foreground)] mt-0.5 truncate">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-0.5">
            <MapPin size={12} className="text-[var(--primary)]" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* Participants */}
          {maxParticipants > 0 && (
            <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-0.5">
              <Users size={12} className="text-[var(--primary)]" />
              <span>
                {maxParticipants - availableSpots}/{maxParticipants}人
              </span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
