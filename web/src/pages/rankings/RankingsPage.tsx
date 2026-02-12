import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Menu, Calendar } from 'lucide-react';
import { api } from '@/services/api';
import type { TeamRanking } from '@/services/api';
import { Loading } from '@/components/ui';
import { RankingsSEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';

type RankingType = 'members' | 'events';

export function RankingsPage() {
  const { openDrawer } = useDrawer();
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rankingType, setRankingType] = useState<RankingType>('members');

  useEffect(() => {
    loadRankings();
  }, [rankingType]);

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTeamRankings(rankingType);
      setRankings(data);
    } catch (error) {
      console.error('Failed to load rankings:', error);
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

        {/* Segment Control */}
        <div style={{
          display: 'flex',
          background: '#F0F0F0',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            onClick={() => setRankingType('members')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: rankingType === 'members' ? '#FFFFFF' : 'transparent',
              color: rankingType === 'members' ? '#1a1a2e' : '#888888',
              boxShadow: rankingType === 'members' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            メンバー数
          </button>
          <button
            onClick={() => setRankingType('events')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: rankingType === 'events' ? '#FFFFFF' : 'transparent',
              color: rankingType === 'events' ? '#1a1a2e' : '#888888',
              boxShadow: rankingType === 'events' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            公開イベント数
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '24px' }}>
        {isLoading ? (
          <div style={{ paddingTop: '40px', textAlign: 'center' }}>
            <Loading size="lg" />
            <p style={{ color: '#888888', fontSize: '14px', marginTop: '16px' }}>ピックルボールランキングを読み込み中...</p>
            <p style={{ color: '#AAAAAA', fontSize: '12px', marginTop: '8px' }}>アクティブなピックルボールプレイヤー・サークルのランキングをチェックしよう。</p>
          </div>
        ) : rankings.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Trophy size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '20px', marginBottom: '8px' }}>
              ランキングがありません
            </h3>
            <p style={{ color: '#888888' }}>サークルが登録されるとランキングが表示されます</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rankings.map((team) => (
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
                  {/* Rank */}
                  <div style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {team.rank <= 3 ? (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: getMedalColor(team.rank),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}>
                        {team.rank}
                      </div>
                    ) : (
                      <span style={{ fontSize: '18px', fontWeight: 600, color: '#888888' }}>
                        {team.rank}
                      </span>
                    )}
                  </div>

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
                      {rankingType === 'events' ? (
                        <Calendar size={14} style={{ color: '#65A30D' }} />
                      ) : (
                        <Users size={14} style={{ color: '#65A30D' }} />
                      )}
                      <span style={{ fontSize: '13px', color: '#888888' }}>
                        {rankingType === 'events'
                          ? `${team.publicEventCount}イベント`
                          : `${team.memberCount}人`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
