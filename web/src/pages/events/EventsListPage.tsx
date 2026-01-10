import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, Search } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { formatDateTime, getDisplayName } from '@/lib/utils';
import { PREFECTURES } from '@/lib/prefectures';
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
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          fontStyle: 'italic',
          textAlign: 'center',
          color: '#1a1a2e',
          marginBottom: '12px'
        }}>
          PickleHub
        </h1>

        {/* Segment Control */}
        <div style={{
          display: 'flex',
          background: '#F0F0F0',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '12px'
        }}>
          <button
            onClick={() => setSegment('public')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: segment === 'public' ? '#FFFFFF' : 'transparent',
              color: segment === 'public' ? '#1a1a2e' : '#888888',
              boxShadow: segment === 'public' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            公開イベント
          </button>
          <button
            onClick={() => setSegment('team')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: segment === 'team' ? '#FFFFFF' : 'transparent',
              color: segment === 'team' ? '#1a1a2e' : '#888888',
              boxShadow: segment === 'team' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            マイチームイベント
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Region Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F0F0F0',
            borderRadius: '10px',
            padding: '8px 12px',
            minWidth: '100px'
          }}>
            <MapPin size={16} style={{ color: '#667eea', flexShrink: 0 }} />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1a1a2e',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">全国</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F0F0F0',
            borderRadius: '10px',
            padding: '8px 12px'
          }}>
            <Search size={16} style={{ color: '#888888', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="イベントを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#1a1a2e',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <Loading size="lg" />
          </div>
        ) : segment === 'public' ? (
          allPublicEvents.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <Calendar size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
                イベントが見つかりません
              </h3>
              <p style={{ color: '#888888' }}>最初のイベントを作成しましょう！</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allPublicEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        ) : filteredTeamEvents.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Users size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              チームイベントが見つかりません
            </h3>
            <p style={{ color: '#888888' }}>
              チームに参加してイベントを確認しましょう
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTeamEvents.map((event) => (
              <TeamEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/events/create')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#FFFFFF',
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

function EventCard({ event }: { event: Event | TeamEvent }) {
  const isTeamEvent = 'team' in event;
  const linkTo = isTeamEvent
    ? `/teams/${(event as TeamEvent).team.id}/events/${event.id}`
    : `/events/${event.id}`;

  const displayImage = isTeamEvent
    ? (event as TeamEvent).team.iconImage
    : event.creator.profileImage;
  const displayName = isTeamEvent
    ? (event as TeamEvent).team.name
    : getDisplayName(event.creator);

  return (
    <Link
      to={linkTo}
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px',
        textDecoration: 'none',
        transition: 'background 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {displayImage ? (
              <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '20px' }}>🏓</span>
            )}
          </div>
        </div>

        {/* Event Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Calendar size={14} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '13px', color: '#888888' }}>
              {formatDateTime(event.startTime)}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a2e',
            marginBottom: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.title}
          </h3>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} style={{ color: '#667eea' }} />
            <span style={{
              fontSize: '13px',
              color: '#888888',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {event.location}
            </span>
          </div>

          {/* Host */}
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#AAAAAA'
          }}>
            by {displayName}
          </div>
        </div>
      </div>
    </Link>
  );
}

function TeamEventCard({ event }: { event: TeamEvent }) {
  return (
    <Link
      to={`/teams/${event.team.id}/events/${event.id}`}
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px',
        textDecoration: 'none',
        transition: 'background 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {event.team.iconImage ? (
              <img src={event.team.iconImage} alt={event.team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '20px' }}>🏓</span>
            )}
          </div>
        </div>

        {/* Event Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Calendar size={14} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '13px', color: '#888888' }}>
              {formatDateTime(event.startTime)}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a2e',
            marginBottom: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.title}
          </h3>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} style={{ color: '#667eea' }} />
            <span style={{
              fontSize: '13px',
              color: '#888888',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {event.location}
            </span>
          </div>

          {/* Team Name */}
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#AAAAAA'
          }}>
            {event.team.name}
          </div>
        </div>
      </div>
    </Link>
  );
}
