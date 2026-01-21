import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MapPin, Crown, Menu } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import { TeamsListSEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { PREFECTURES } from '@/lib/prefectures';
import type { Team } from '@/types';

export function TeamsListPage() {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    loadTeams();
  }, [selectedRegion, isAuthenticated]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      // 未ログイン時はマイチームを取得しない
      if (isAuthenticated) {
        const [allTeams, userTeams] = await Promise.all([
          api.getTeams({ region: selectedRegion || undefined }),
          api.getTeams({ myTeams: true }),
        ]);
        setTeams(allTeams);
        setMyTeams(userTeams);
      } else {
        const allTeams = await api.getTeams({ region: selectedRegion || undefined });
        setTeams(allTeams);
        setMyTeams([]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) => {
    // Exclude teams that are already in myTeams
    const isMyTeam = myTeams.some((myTeam) => myTeam.id === team.id);
    if (isMyTeam) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    );
  });

  const filteredMyTeams = myTeams.filter((team) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7'
    }}>
      <TeamsListSEO />
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
              placeholder="サークルを検索"
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* My Teams Section */}
            {filteredMyTeams.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#888888',
                  marginBottom: '12px',
                  letterSpacing: '1px'
                }}>
                  MY TEAMS
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredMyTeams.map((team) => (
                    <TeamCard key={team.id} team={team} isMyTeam />
                  ))}
                </div>
              </section>
            )}

            {/* Find Teams Section */}
            <section>
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#888888',
                marginBottom: '12px',
                letterSpacing: '1px'
              }}>
                TEAMS
              </h2>
              {filteredTeams.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                  <Users size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
                    サークルが見つかりません
                  </h3>
                  <p style={{ color: '#888888' }}>新しいサークルを作成しましょう</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredTeams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* FAB - ログイン時のみ表示 */}
      {isAuthenticated && (
        <button
          onClick={() => navigate('/teams/create')}
          style={{
            position: 'fixed',
            bottom: '24px',
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
            zIndex: 50
          }}
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

function TeamCard({ team, isMyTeam }: { team: Team; isMyTeam?: boolean }) {
  return (
    <Link
      to={`/teams/${team.id}`}
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
            background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {team.iconImage ? (
              <img src={team.iconImage} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '20px' }}>🏓</span>
            )}
          </div>
        </div>

        {/* Team Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a2e',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {team.name}
            </h3>
            {isMyTeam && (
              <Crown size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
            )}
          </div>

          {/* Description */}
          {team.description && (
            <p style={{
              fontSize: '13px',
              color: '#888888',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {team.description}
            </p>
          )}

          {/* Member count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} style={{ color: '#65A30D' }} />
            <span style={{ fontSize: '13px', color: '#888888' }}>{team.memberCount}人</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
