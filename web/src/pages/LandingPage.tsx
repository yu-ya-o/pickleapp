import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, MessageCircle, ChevronRight } from 'lucide-react';
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
    .slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #FFFFFF 100%)',
        padding: '20px 20px 40px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a1a2e'
          }}>
            PickleHub
          </h1>
          <Link
            to="/login"
            style={{
              padding: '10px 24px',
              background: '#22c55e',
              color: '#FFFFFF',
              borderRadius: '24px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            はじめる
          </Link>
        </header>

        {/* Main Hero Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          paddingBottom: '40px'
        }}>
          {/* Pickle emoji */}
          <div style={{
            fontSize: '64px',
            marginBottom: '24px'
          }}>
            🥒
          </div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#1a1a2e',
            marginBottom: '16px',
            lineHeight: 1.3
          }}>
            ピックルボールの
            <br />
            <span style={{ color: '#22c55e' }}>仲間</span>を見つけよう
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#666666',
            marginBottom: '32px',
            lineHeight: 1.7,
            maxWidth: '300px'
          }}>
            イベントに参加したり、サークルを作って
            一緒にピックルボールを楽しもう
          </p>

          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 40px',
              background: '#22c55e',
              color: '#FFFFFF',
              borderRadius: '32px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
            }}
          >
            無料ではじめる
            <ChevronRight size={20} />
          </Link>

          <p style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#999999'
          }}>
            Googleアカウントで簡単登録
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{
          textAlign: 'center',
          color: '#CCCCCC',
          fontSize: '12px'
        }}>
          <div style={{
            width: '24px',
            height: '40px',
            border: '2px solid #DDDDDD',
            borderRadius: '12px',
            margin: '0 auto 8px',
            position: 'relative'
          }}>
            <div style={{
              width: '4px',
              height: '8px',
              background: '#CCCCCC',
              borderRadius: '2px',
              position: 'absolute',
              left: '50%',
              top: '8px',
              transform: 'translateX(-50%)',
              animation: 'scrollDown 1.5s infinite'
            }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 20px', background: '#FFFFFF' }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#22c55e',
          textAlign: 'center',
          marginBottom: '8px',
          letterSpacing: '2px'
        }}>
          FEATURES
        </h3>
        <h4 style={{
          fontSize: '24px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '40px',
          color: '#1a1a2e'
        }}>
          PickleHubでできること
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FeatureCard
            icon={<Calendar size={24} />}
            title="イベントを探す"
            description="近くのピックルボールイベントを探して参加できます"
            color="#22c55e"
          />
          <FeatureCard
            icon={<Users size={24} />}
            title="サークルを作る"
            description="仲間とサークルを作って定期的に活動"
            color="#3b82f6"
          />
          <FeatureCard
            icon={<MessageCircle size={24} />}
            title="チャットで連絡"
            description="イベントやサークルのメンバーと簡単に連絡"
            color="#f59e0b"
          />
        </div>
      </section>

      {/* Events Section */}
      {allUpcomingEvents.length > 0 && (
        <section style={{ padding: '60px 20px', background: '#f9fafb' }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#22c55e',
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '2px'
          }}>
            EVENTS
          </h3>
          <h4 style={{
            fontSize: '24px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '32px',
            color: '#1a1a2e'
          }}>
            開催予定のイベント
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allUpcomingEvents.map((event) => (
              <EventCard key={`${event.type}-${event.id}`} event={event} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              to="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: '#22c55e',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              すべてのイベントを見る
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: '#1a1a2e',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '24px'
        }}>
          🏓
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '12px'
        }}>
          さあ、始めよう
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '32px'
        }}>
          ピックルボール仲間があなたを待っています
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 40px',
            background: '#22c55e',
            color: '#FFFFFF',
            borderRadius: '32px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          無料で登録
          <ChevronRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px',
        background: '#111111',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#FFFFFF',
          marginBottom: '4px'
        }}>
          PickleHub
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
          ピックルボールコミュニティ
        </p>
      </footer>

      <style>{`
        @keyframes scrollDown {
          0%, 100% { opacity: 1; top: 8px; }
          50% { opacity: 0.3; top: 16px; }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: `${color}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <h5 style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '4px',
          color: '#1a1a2e'
        }}>
          {title}
        </h5>
        <p style={{
          fontSize: '13px',
          color: '#888888',
          lineHeight: 1.5
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: (Event | TeamEvent) & { type: 'event' | 'teamEvent' } }) {
  const linkTo = event.type === 'teamEvent'
    ? `/teams/${(event as TeamEvent).team.id}/events/${event.id}`
    : `/events/${event.id}`;

  return (
    <Link
      to={linkTo}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px',
        textDecoration: 'none',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: '#f0fdf4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0
      }}>
        🏓
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px',
          color: '#22c55e',
          fontWeight: 500,
          marginBottom: '2px'
        }}>
          {formatDateTime(event.startTime)}
        </div>
        <div style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#1a1a2e',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {event.title}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999999',
          marginTop: '2px'
        }}>
          {event.location}
        </div>
      </div>
      <ChevronRight size={20} color="#CCCCCC" />
    </Link>
  );
}
