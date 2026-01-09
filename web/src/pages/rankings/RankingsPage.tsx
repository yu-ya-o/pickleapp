import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy } from 'lucide-react';
import { api } from '@/services/api';
import type { TeamRanking } from '@/services/api';
import { Loading, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

type RankingType = 'members' | 'events';

export function RankingsPage() {
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
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-[var(--muted-foreground)]';
    }
  };

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-transparent';
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className={cn('flex items-center justify-center w-10', getMedalColor(rank))}>
          <svg viewBox="0 0 36 36" className="w-8 h-8">
            <circle cx="18" cy="18" r="16" fill="currentColor" />
            <text
              x="18"
              y="24"
              textAnchor="middle"
              className="fill-white text-sm font-bold"
              style={{ fontSize: '14px' }}
            >
              {rank}
            </text>
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10">
        <span className="text-lg font-semibold text-[var(--muted-foreground)]">{rank}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-center text-lg font-semibold pt-6 pb-12">ランキング</h1>

          {/* Segment Control */}
          <div className="pb-4">
            <div className="flex bg-[var(--muted)] rounded-xl p-1.5">
              <button
                onClick={() => setRankingType('members')}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                  rankingType === 'members'
                    ? 'bg-white shadow-sm text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]'
                )}
              >
                メンバー数
              </button>
              <button
                onClick={() => setRankingType('events')}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                  rankingType === 'events'
                    ? 'bg-white shadow-sm text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]'
                )}
              >
                公開イベント数
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="mx-auto text-[var(--muted-foreground)]" size={56} />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mt-5 mb-2">
              ランキングがありません
            </h3>
            <p className="text-[var(--muted-foreground)]">
              チームが登録されるとランキングが表示されます
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)] bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            {rankings.map((team) => (
              <li key={team.id}>
                <Link
                  to={`/teams/${team.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors"
                >
                  {/* Rank */}
                  {getRankDisplay(team.rank)}

                  {/* Team Icon */}
                  <Avatar
                    src={team.iconImage}
                    alt={team.name}
                    size="lg"
                  />

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 break-words text-base">
                      {team.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-0.5">
                      {team.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mt-1">
                      <Users size={14} className="text-[var(--primary)]" />
                      <span>{team.memberCount}人</span>
                    </div>
                  </div>

                  {/* Trophy for top 3 */}
                  {team.rank <= 3 && (
                    <Trophy size={28} className={getTrophyColor(team.rank)} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
