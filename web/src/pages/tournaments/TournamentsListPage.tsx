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

      {/* Header - PickleHub ロゴ（イベント一覧と同じ） */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
      </header>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '24px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Medal size={56} style={{ color: '#DC2626', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              {error}
            </h3>
            <button
              onClick={() => loadTournaments()}
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
        ) : tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Medal size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              大会情報はまだありません
            </h3>
            <p style={{ color: '#888888' }}>最初の大会を作成しましょう！</p>
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
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    {/* Thumbnail */}
                    <div style={{ flexShrink: 0 }}>
                      {tournament.coverImage ? (
                        <img
                          src={tournament.coverImage}
                          alt=""
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Medal size={24} style={{ color: '#FFFFFF' }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Calendar size={14} style={{ color: '#65A30D' }} />
                        <span style={{ fontSize: '13px', color: '#888888' }}>
                          {tournament.eventDate}
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
                        {tournament.title}
                      </h3>

                      {/* Venue */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} style={{ color: '#65A30D' }} />
                        <span style={{
                          fontSize: '13px',
                          color: '#888888',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {tournament.venue}
                        </span>
                      </div>

                      {/* Organizer */}
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#AAAAAA'
                      }}>
                        主催: {tournament.organizer}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB - ログイン時のみ表示 */}
      {isAuthenticated && (
        <button
          onClick={() => navigate('/tournaments/create')}
          style={{
            position: 'fixed',
            bottom: '80px',
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
