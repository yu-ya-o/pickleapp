import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Medal, MapPin, Search, Menu } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { SEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { PREFECTURES } from '@/lib/prefectures';
import type { Tournament } from '@/types';

export function TournamentsListPage() {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

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

  const filteredTournaments = tournaments.filter((t) => {
    // Prefecture filter
    if (selectedRegion) {
      const addr = (t.address || '').toLowerCase() + (t.venue || '').toLowerCase();
      if (!addr.includes(selectedRegion.toLowerCase())) return false;
    }
    // Free text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.venue.toLowerCase().includes(query) ||
        (t.address || '').toLowerCase().includes(query) ||
        t.organizer.toLowerCase().includes(query) ||
        t.events.toLowerCase().includes(query)
      );
    }
    return true;
  });

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

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
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
              placeholder="大会を検索"
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
        ) : filteredTournaments.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Medal size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              {tournaments.length === 0 ? '大会情報はまだありません' : '大会が見つかりません'}
            </h3>
            <p style={{ color: '#888888' }}>
              {tournaments.length === 0 ? '最初の大会を作成しましょう！' : '検索条件を変更してお試しください'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/tournaments/${tournament.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Banner Image */}
                  <div style={{ position: 'relative' }}>
                    {tournament.coverImage ? (
                      <img
                        src={tournament.coverImage}
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
                        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 40%, #1e3a5f 70%, #4a9bd9 100%)',
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
                          background: 'linear-gradient(135deg, transparent 30%, rgba(74,155,217,0.3) 50%, transparent 70%)',
                          transform: 'rotate(-15deg)',
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: '-10%',
                          left: '-5%',
                          width: '40%',
                          height: '80%',
                          background: 'linear-gradient(135deg, rgba(100,200,255,0.2) 0%, transparent 60%)',
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
                          TOURNAMENT
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
                      {tournament.title}
                    </h3>
                  </div>

                  {/* Info Table */}
                  <div style={{ padding: '8px 0', margin: '0 16px' }}>
                    <InfoRow label="開催日" value={tournament.eventDate} />
                    <InfoRow label="会場" value={tournament.address ? `${tournament.venue}（${tournament.address}）` : tournament.venue} />
                    <InfoRow label="種目" value={tournament.events} isLast />
                  </div>

                  {/* Detail Button */}
                  <div style={{ padding: '8px 16px 14px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        padding: '8px 48px',
                        borderRadius: '6px',
                      }}
                    >
                      詳細を見る
                    </span>
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

/** カード内の情報行 */
function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
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
