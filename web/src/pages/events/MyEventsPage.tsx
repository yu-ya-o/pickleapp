import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Menu } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { useDrawer } from '@/components/layout/MainLayout';
import { formatDateTime, getDisplayName } from '@/lib/utils';
import type { Event, TeamEvent } from '@/types';

type TabType = 'upcoming' | 'past';

type MyEvent = {
  type: 'event' | 'teamEvent';
  data: Event | TeamEvent;
  startTime: Date;
};

export function MyEventsPage() {
  const { openDrawer } = useDrawer();
  const [reservedEvents, setReservedEvents] = useState<Event[]>([]);
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>('upcoming');

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [reservations, upcomingTeamEvents, pastTeamEvents] = await Promise.all([
        api.getMyReservations(),
        api.getMyTeamEvents(true),  // upcoming
        api.getMyTeamEvents(false), // past (will use ?past=true or no param)
      ]);
      // Merge and dedupe team events
      const allTeamEvents = [...upcomingTeamEvents, ...pastTeamEvents];
      const uniqueTeamEvents = allTeamEvents.filter((event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
      );
      console.log('reservations:', reservations);
      console.log('upcomingTeamEvents:', upcomingTeamEvents);
      console.log('pastTeamEvents:', pastTeamEvents);
      setReservedEvents(reservations);
      setTeamEvents(uniqueTeamEvents);
    } catch (err) {
      console.error('Failed to load my events:', err);
      setError('イベントの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();

  // Combine and categorize events
  const allMyEvents: MyEvent[] = [
    ...reservedEvents.map((e) => ({
      type: 'event' as const,
      data: e,
      startTime: new Date(e.startTime),
    })),
    ...teamEvents
      .filter((e) => e.isUserParticipating)
      .map((e) => ({
        type: 'teamEvent' as const,
        data: e,
        startTime: new Date(e.startTime),
      })),
  ];

  const upcomingEvents = allMyEvents
    .filter((e) => e.startTime >= now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const pastEvents = allMyEvents
    .filter((e) => e.startTime < now)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  const displayedEvents = tab === 'upcoming' ? upcomingEvents : pastEvents;

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
        {/* Title Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <button
            onClick={openDrawer}
            className="md:hidden"
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
            fontSize: '20px',
            fontWeight: 700,
            color: '#1a1a2e'
          }}>
            マイイベント
          </h1>
          <div style={{ width: '36px' }} className="md:hidden" />
        </div>

        {/* Tab Control */}
        <div style={{
          display: 'flex',
          background: '#F0F0F0',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            onClick={() => setTab('upcoming')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === 'upcoming' ? '#FFFFFF' : 'transparent',
              color: tab === 'upcoming' ? '#1a1a2e' : '#888888',
              boxShadow: tab === 'upcoming' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            これから ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setTab('past')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === 'past' ? '#FFFFFF' : 'transparent',
              color: tab === 'past' ? '#1a1a2e' : '#888888',
              boxShadow: tab === 'past' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            これまで ({pastEvents.length})
          </button>
        </div>
      </header>

      {/* Debug Info */}
      <div style={{ padding: '8px 16px', background: '#FEF3C7', fontSize: '12px' }}>
        <div>通常イベント: {reservedEvents.length}件</div>
        <div>サークルイベント: {teamEvents.length}件 (参加中: {teamEvents.filter(e => e.isUserParticipating).length}件)</div>
        <div>これから: {upcomingEvents.length}件 / これまで: {pastEvents.length}件</div>
        <div style={{ marginTop: '4px', borderTop: '1px solid #ddd', paddingTop: '4px' }}>未来のサークルイベント:</div>
        {teamEvents.filter(e => new Date(e.startTime) >= new Date()).map(e => (
          <div key={e.id}>{e.title}: 参加={String(e.isUserParticipating)}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '24px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Calendar size={56} style={{ color: '#DC2626', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              {error}
            </h3>
            <button
              onClick={() => loadMyEvents()}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              再試行
            </button>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Calendar size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              {tab === 'upcoming' ? '参加予定のイベントはありません' : '参加済みのイベントはありません'}
            </h3>
            <p style={{ color: '#888888' }}>
              {tab === 'upcoming' ? 'イベントを探して参加しましょう！' : ''}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedEvents.map((event) => (
              <MyEventCard key={`${event.type}-${event.data.id}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyEventCard({ event }: { event: MyEvent }) {
  const isTeamEvent = event.type === 'teamEvent';
  const data = event.data;

  const linkTo = isTeamEvent
    ? `/teams/${(data as TeamEvent).team.id}/events/${data.id}`
    : `/events/${data.id}`;

  const displayImage = isTeamEvent
    ? (data as TeamEvent).team.iconImage
    : (data as Event).creator.profileImage;
  const displayName = isTeamEvent
    ? (data as TeamEvent).team.name
    : getDisplayName((data as Event).creator);

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
              <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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
              {formatDateTime(data.startTime)}
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
            {data.title}
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
              {data.location}
            </span>
          </div>

          {/* Host/Team */}
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#AAAAAA'
          }}>
            {isTeamEvent ? displayName : `by ${displayName}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
