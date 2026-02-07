import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Medal, Calendar, MapPin, Menu } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { SEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Tournament } from '@/types';

export function TournamentsListPage() {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getTournaments({ status: 'active' });
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
      setError('大会情報の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <SEO
        title="大会一覧 | PickleHub"
        description="ピックルボールの大会情報一覧。大会を探して参加しよう。"
        keywords="ピックルボール, 大会, トーナメント, pickleball, tournament"
        url="/tournaments"
      />

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E5E5E5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={openDrawer}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <Menu size={24} style={{ color: '#1a1a2e' }} />
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>大会</h1>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/tournaments/create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              <Plus size={18} />
              <span>大会を作成</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#DC2626' }}>{error}</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Medal size={48} style={{ color: '#CCCCCC', margin: '0 auto 12px' }} />
            <p style={{ color: '#888888', fontSize: '16px' }}>大会情報はまだありません</p>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/tournaments/create')}
                style={{
                  marginTop: '16px',
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                最初の大会を作成
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/tournaments/${tournament.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Medal size={16} style={{ color: '#65A30D' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#65A30D' }}>大会</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
                    {tournament.title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} style={{ color: '#888888' }} />
                      <span style={{ fontSize: '13px', color: '#666666' }}>{tournament.eventDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} style={{ color: '#888888' }} />
                      <span style={{ fontSize: '13px', color: '#666666' }}>{tournament.venue}</span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#888888',
                    marginTop: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {tournament.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
