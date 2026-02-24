import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Menu, Calendar, User } from 'lucide-react';
import { api } from '@/services/api';
import type { TeamRanking, UserDuprRanking } from '@/services/api';
import { Loading } from '@/components/ui';
import { RankingsSEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';

type MainTab = 'team' | 'dupr';
type TeamRankingType = 'members' | 'events';
type DuprType = 'doubles' | 'singles';

export function RankingsPage() {
  const { openDrawer } = useDrawer();
  const [mainTab, setMainTab] = useState<MainTab>('team');
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);
  const [duprRankings, setDuprRankings] = useState<UserDuprRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamRankingType, setTeamRankingType] = useState<TeamRankingType>('members');
  const [duprType, setDuprType] = useState<DuprType>('doubles');

  useEffect(() => {
    if (mainTab === 'team') {
      loadTeamRankings();
    } else {
      loadDuprRankings();
    }
  }, [mainTab, teamRankingType, duprType]);

  const loadTeamRankings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTeamRankings(teamRankingType);
      setTeamRankings(data);
    } catch (error) {
      console.error('Failed to load team rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDuprRankings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUserDuprRankings(duprType);
      setDuprRankings(data);
    } catch (error) {
      console.error('Failed to load DUPR rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#F59E0B'; // gold
      case 2:
        return '#9CA3AF'; // silver
      case 3:
        return '#D97706'; // bronze
      default:
        return '#888888';
    }
  };

  const renderSegmentButton = (
    label: string,
    isActive: boolean,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 0',
        fontSize: '14px',
        fontWeight: 500,
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isActive ? '#FFFFFF' : 'transparent',
        color: isActive ? '#1a1a2e' : '#888888',
        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      {label}
    </button>
  );

  const renderRankBadge = (rank: number) => (
    <div style={{
      width: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {rank <= 3 ? (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: getMedalColor(rank),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '14px'
        }}>
          {rank}
        </div>
      ) : (
        <span style={{ fontSize: '18px', fontWeight: 600, color: '#888888' }}>
          {rank}
        </span>
      )}
    </div>
  );

  const renderTeamRankings = () => {
    if (teamRankings.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <Trophy size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
            ランキングがありません
          </h3>
          <p style={{ color: '#888888' }}>サークルが登録されるとランキングが表示されます</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {teamRankings.map((team) => (
          <Link
            key={team.id}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {renderRankBadge(team.rank)}

              {/* Team Icon */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {team.iconImage ? (
                  <img src={team.iconImage} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '20px' }}>🏓</span>
                )}
              </div>

              {/* Team Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1a1a2e',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {team.name}
                </h3>
                {team.description && (
                  <p style={{
                    fontSize: '13px',
                    color: '#888888',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {team.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {teamRankingType === 'events' ? (
                    <Calendar size={14} style={{ color: '#65A30D' }} />
                  ) : (
                    <Users size={14} style={{ color: '#65A30D' }} />
                  )}
                  <span style={{ fontSize: '13px', color: '#888888' }}>
                    {teamRankingType === 'events'
                      ? `${team.publicEventCount}イベント`
                      : `${team.memberCount}人`}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderDuprRankings = () => {
    if (duprRankings.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <Trophy size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
            ランキングがありません
          </h3>
          <p style={{ color: '#888888' }}>DUPRレーティングを登録するとランキングが表示されます</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {duprRankings.map((user) => {
          const rating = duprType === 'doubles' ? user.duprDoubles : user.duprSingles;
          return (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {renderRankBadge(user.rank)}

                {/* User Avatar */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.nickname || user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} style={{ color: '#FFFFFF' }} />
                  )}
                </div>

                {/* User Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.nickname || user.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.region && (
                      <span style={{ fontSize: '13px', color: '#888888' }}>
                        {user.region}
                      </span>
                    )}
                  </div>
                </div>

                {/* DUPR Rating */}
                <div style={{
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#3B82F6'
                  }}>
                    {rating != null ? rating.toFixed(3) : '-'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#888888',
                    marginTop: '2px'
                  }}>
                    DUPR
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7'
    }}>
      <RankingsSEO />
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

        {/* Main Tab: Team vs DUPR */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '8px'
        }}>
          {(['team', 'dupr'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              style={{
                padding: '0',
                fontSize: '13px',
                fontWeight: mainTab === tab ? 600 : 400,
                border: 'none',
                borderBottom: mainTab === tab ? '2px solid #1a1a2e' : '2px solid transparent',
                cursor: 'pointer',
                background: 'transparent',
                color: mainTab === tab ? '#1a1a2e' : '#AAAAAA',
                paddingBottom: '4px',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'team' ? 'サークル' : 'DUPR'}
            </button>
          ))}
        </div>

        {/* Sub Segment Control */}
        <div style={{
          display: 'flex',
          background: '#F0F0F0',
          borderRadius: '12px',
          padding: '4px'
        }}>
          {mainTab === 'team' ? (
            <>
              {renderSegmentButton('メンバー数', teamRankingType === 'members', () => setTeamRankingType('members'))}
              {renderSegmentButton('公開イベント数', teamRankingType === 'events', () => setTeamRankingType('events'))}
            </>
          ) : (
            <>
              {renderSegmentButton('ダブルス', duprType === 'doubles', () => setDuprType('doubles'))}
              {renderSegmentButton('シングルス', duprType === 'singles', () => setDuprType('singles'))}
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '24px' }}>
        {isLoading ? (
          <div style={{ paddingTop: '40px', textAlign: 'center' }}>
            <Loading size="lg" />
            <p style={{ color: '#888888', fontSize: '14px', marginTop: '16px' }}>ピックルボールプレイヤー・サークルランキング</p>
            <p style={{ color: '#AAAAAA', fontSize: '12px', marginTop: '8px' }}>アクティブなピックルボールプレイヤー・サークルのランキングをチェックしよう。</p>
          </div>
        ) : mainTab === 'team' ? (
          renderTeamRankings()
        ) : (
          renderDuprRankings()
        )}
      </div>
    </div>
  );
}
