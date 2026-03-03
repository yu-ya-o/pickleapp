import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, Search, Menu } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { EventsListSEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime, getDisplayName } from '@/lib/utils';
import { PREFECTURES } from '@/lib/prefectures';
import type { Event, TeamEvent } from '@/types';

type SegmentType = 'public' | 'team';

export function EventsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([]);
  const [publicTeamEvents, setPublicTeamEvents] = useState<TeamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedRegion = searchParams.get('region') || '';
  const [segment, setSegment] = useState<SegmentType>('public');

  useEffect(() => {
    loadEvents();
  }, [selectedRegion, segment, isAuthenticated]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // 未ログイン時は常に公開イベントのみ
      if (!isAuthenticated || segment === 'public') {
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
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('イベントの読み込みに失敗しました');
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
      <EventsListSEO />
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
            fontSize: '24px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#1a1a2e'
          }}>
            PickleHub
          </h1>
          <div style={{ width: '36px' }} className="md:hidden" />
        </div>

        {/* Segment Control - ログイン時のみ表示 */}
        {isAuthenticated && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            {([{ label: '公開イベント', value: 'public' as const }, { label: '所属サークルイベント', value: 'team' as const }]).map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSegment(value)}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: segment === value ? '#1a1a2e' : '#F0F0F0',
                  color: segment === value ? '#FFFFFF' : '#888888'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

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
            <MapPin size={16} style={{ color: '#65A30D', flexShrink: 0 }} />
            <select
              value={selectedRegion}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setSearchParams({ region: value });
                } else {
                  setSearchParams({});
                }
              }}
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
      <div style={{ padding: '16px', paddingBottom: '24px' }}>
        {isLoading ? (
          <div style={{ paddingTop: '40px', textAlign: 'center' }}>
            <Loading size="lg" />
            <p style={{ color: '#888888', fontSize: '14px', marginTop: '16px' }}>全国のピックルボールイベント・大会情報</p>
            <p style={{ color: '#AAAAAA', fontSize: '12px', marginTop: '8px' }}>初心者歓迎のイベントから上級者向けトーナメントまで、参加者募集中のイベントを探せます。</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Calendar size={56} style={{ color: '#DC2626', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              {error}
            </h3>
            <button
              onClick={() => loadEvents()}
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
              再試行
            </button>
          </div>
        ) : (!isAuthenticated || segment === 'public') ? (
          allPublicEvents.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <Calendar size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
                イベントが見つかりません
              </h3>
              <p style={{ color: '#888888' }}>最初のイベントを作成しましょう！</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {allPublicEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        ) : filteredTeamEvents.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Users size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              サークルイベントが見つかりません
            </h3>
            <p style={{ color: '#888888' }}>
              サークルに参加してイベントを確認しましょう
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredTeamEvents.map((event) => (
              <TeamEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* FAB - ログイン時のみ表示 */}
      {isAuthenticated && (
        <button
          onClick={() => navigate('/events/create')}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '16px',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
            color: '#FFFFFF',
            borderRadius: '50%',
            border: 'none',
            boxShadow: '0 4px 20px rgba(101, 163, 13, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60
          }}
        >
          <Plus size={24} />
        </button>
      )}
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
    <Link to={linkTo} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        {/* Banner Image */}
        <div style={{ position: 'relative' }}>
          {displayImage ? (
            <img
              src={displayImage}
              alt=""
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '160px',
              background: 'linear-gradient(135deg, #2d5a1b 0%, #4a8c2a 40%, #2d5a1b 70%, #65A30D 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '60%',
                height: '140%',
                background: 'linear-gradient(135deg, transparent 30%, rgba(163,230,53,0.3) 50%, transparent 70%)',
                transform: 'rotate(-15deg)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '40%',
                height: '80%',
                background: 'linear-gradient(135deg, rgba(163,230,53,0.2) 0%, transparent 60%)',
                transform: 'rotate(10deg)',
              }} />
              <span style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '2px',
                zIndex: 1,
              }}>
                PICKLEBALL
              </span>
              <span style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                zIndex: 1,
                marginTop: '4px',
              }}>
                EVENT
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ padding: '12px 16px 0' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#1a1a2e',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {event.title}
          </h3>
        </div>

        {/* Info Table */}
        <div style={{ padding: '8px 0', margin: '0 16px' }}>
          <EventInfoRow label="開催日" value={formatDateTime(event.startTime)} />
          <EventInfoRow label="会場" value={event.location} />
          <EventInfoRow label="主催者" value={displayName} isLast />
        </div>

        {/* Detail Button */}
        <div style={{ padding: '8px 16px 14px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            padding: '8px 48px',
            borderRadius: '6px',
          }}>
            詳細を見る
          </span>
        </div>
      </div>
    </Link>
  );
}

function TeamEventCard({ event }: { event: TeamEvent }) {
  return (
    <Link to={`/teams/${event.team.id}/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        {/* Banner Image */}
        <div style={{ position: 'relative' }}>
          {event.team.iconImage ? (
            <img
              src={event.team.iconImage}
              alt=""
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '160px',
              background: 'linear-gradient(135deg, #2d5a1b 0%, #4a8c2a 40%, #2d5a1b 70%, #65A30D 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '60%',
                height: '140%',
                background: 'linear-gradient(135deg, transparent 30%, rgba(163,230,53,0.3) 50%, transparent 70%)',
                transform: 'rotate(-15deg)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '40%',
                height: '80%',
                background: 'linear-gradient(135deg, rgba(163,230,53,0.2) 0%, transparent 60%)',
                transform: 'rotate(10deg)',
              }} />
              <span style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '2px',
                zIndex: 1,
              }}>
                PICKLEBALL
              </span>
              <span style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                zIndex: 1,
                marginTop: '4px',
              }}>
                EVENT
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ padding: '12px 16px 0' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#1a1a2e',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {event.title}
          </h3>
        </div>

        {/* Info Table */}
        <div style={{ padding: '8px 0', margin: '0 16px' }}>
          <EventInfoRow label="開催日" value={formatDateTime(event.startTime)} />
          <EventInfoRow label="会場" value={event.location} />
          <EventInfoRow label="サークル" value={event.team.name} isLast />
        </div>

        {/* Detail Button */}
        <div style={{ padding: '8px 16px 14px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            padding: '8px 48px',
            borderRadius: '6px',
          }}>
            詳細を見る
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventInfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: isLast ? 'none' : '1px solid #E5E5E5',
      minHeight: '40px',
    }}>
      <div style={{
        width: '72px',
        minWidth: '72px',
        background: '#F9FAFB',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #E5E5E5',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{label}</span>
      </div>
      <div style={{
        flex: 1,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '13px', color: '#333333', lineHeight: 1.5 }}>{value}</span>
      </div>
    </div>
  );
}
