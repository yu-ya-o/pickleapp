import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { Event, TeamEvent } from '@/types';
import { formatDateTime } from '@/lib/utils';

export function LandingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/events', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [publicEvents, publicTeamEvents] = await Promise.all([
          api.getEvents({ upcoming: true }),
          api.getPublicTeamEvents(true),
        ]);
        setEvents(publicEvents.slice(0, 3));
        setTeamEvents(publicTeamEvents.slice(0, 3));
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    loadEvents();
  }, []);

  if (authLoading) {
    return null;
  }

  const allUpcomingEvents = [
    ...events.map(e => ({ ...e, type: 'event' as const })),
    ...teamEvents.map(e => ({ ...e, type: 'teamEvent' as const })),
  ]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #E5E5E5'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          fontStyle: 'italic',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          PickleHub
        </h1>
        <Link
          to="/login"
          style={{
            padding: '8px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          ログイン
        </Link>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 20px',
        textAlign: 'center',
        color: '#FFFFFF'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '16px',
          lineHeight: 1.4
        }}>
          ピックルボールの
          <br />
          仲間を見つけよう
        </h2>
        <p style={{
          fontSize: '16px',
          opacity: 0.9,
          marginBottom: '24px',
          lineHeight: 1.6
        }}>
          イベントに参加したり、サークルを作って
          <br />
          一緒にピックルボールを楽しもう
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#FFFFFF',
            color: '#667eea',
            borderRadius: '30px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          無料で始める
        </Link>
      </section>

      {/* Features Section */}
      <section style={{ padding: '40px 20px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '24px',
          color: '#1a1a2e'
        }}>
          PickleHubでできること
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FeatureCard
            icon={<Calendar size={28} />}
            title="イベントを探す・作る"
            description="近くのピックルボールイベントを探して参加。自分でイベントを作成することもできます。"
          />
          <FeatureCard
            icon={<Users size={28} />}
            title="サークルで仲間と繋がる"
            description="サークルを作成して定期的に活動。メンバーとチャットでコミュニケーション。"
          />
          <FeatureCard
            icon={<MapPin size={28} />}
            title="全国のプレイヤーと出会う"
            description="東京、大阪、名古屋など全国各地のピックルボール仲間と繋がれます。"
          />
        </div>
      </section>

      {/* Upcoming Events Section */}
      {allUpcomingEvents.length > 0 && (
        <section style={{ padding: '0 20px 40px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a2e'
            }}>
              開催予定のイベント
            </h3>
            <Link
              to="/events"
              style={{
                fontSize: '14px',
                color: '#667eea',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              もっと見る <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allUpcomingEvents.map((event) => (
              <EventPreviewCard key={`${event.type}-${event.id}`} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{
        padding: '40px 20px',
        background: '#FFFFFF',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          marginBottom: '12px',
          color: '#1a1a2e'
        }}>
          今すぐ始めよう
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#666666',
          marginBottom: '20px'
        }}>
          無料で登録してピックルボール仲間を見つけよう
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#FFFFFF',
            borderRadius: '30px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          無料で登録
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px',
        background: '#1a1a2e',
        color: '#FFFFFF',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: 700,
          fontStyle: 'italic',
          marginBottom: '8px'
        }}>
          PickleHub
        </p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>
          ピックルボールイベント・サークル管理サービス
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#667eea',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '6px',
          color: '#1a1a2e'
        }}>
          {title}
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#666666',
          lineHeight: 1.5
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function EventPreviewCard({ event }: { event: (Event | TeamEvent) & { type: 'event' | 'teamEvent' } }) {
  const linkTo = event.type === 'teamEvent'
    ? `/teams/${(event as TeamEvent).team.id}/events/${event.id}`
    : `/events/${event.id}`;

  return (
    <Link
      to={linkTo}
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '14px',
        textDecoration: 'none',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{
        fontSize: '12px',
        color: '#667eea',
        marginBottom: '4px'
      }}>
        {formatDateTime(event.startTime)}
      </div>
      <div style={{
        fontSize: '15px',
        fontWeight: 600,
        color: '#1a1a2e',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {event.title}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#888888',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <MapPin size={12} />
        {event.location}
      </div>
    </Link>
  );
}
