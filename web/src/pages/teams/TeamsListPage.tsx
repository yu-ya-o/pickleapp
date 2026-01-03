import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MapPin, Crown } from 'lucide-react';
import { api } from '@/services/api';
import { Loading, Avatar } from '@/components/ui';
import { PREFECTURES } from '@/lib/prefectures';
import type { Team } from '@/types';

export function TeamsListPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    loadTeams();
  }, [selectedRegion]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const [allTeams, userTeams] = await Promise.all([
        api.getTeams({ region: selectedRegion || undefined }),
        api.getTeams({ myTeams: true }),
      ]);
      setTeams(allTeams);
      setMyTeams(userTeams);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-lg font-semibold text-center py-3">チーム</h1>

          {/* Search Bar */}
          <div className="flex gap-2 px-4 pb-3">
            {/* Region Filter */}
            <div className="flex items-center gap-1 px-3 py-2 bg-[var(--muted)] rounded-lg min-w-[100px]">
              <MapPin size={14} className="text-[var(--muted-foreground)] flex-shrink-0" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent border-0 p-0 text-sm outline-none cursor-pointer text-[var(--primary)]"
              >
                <option value="">全て</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--muted)] rounded-lg">
              <Search size={14} className="text-[var(--muted-foreground)] flex-shrink-0" />
              <input
                type="text"
                placeholder="チームを検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-[var(--muted-foreground)]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-20">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {/* My Teams Section */}
            {filteredMyTeams.length > 0 && (
              <section>
                <h2 className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)]">
                  マイチーム
                </h2>
                <ul className="divide-y divide-[var(--border)]">
                  {filteredMyTeams.map((team) => (
                    <TeamRow key={team.id} team={team} isMyTeam />
                  ))}
                </ul>
              </section>
            )}

            {/* Find Teams Section */}
            <section>
              <h2 className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)]">
                チームを探す
              </h2>
              {filteredTeams.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="mx-auto text-[var(--muted-foreground)]" size={48} />
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">
                    チームが見つかりません
                  </h3>
                  <p className="text-[var(--muted-foreground)]">
                    新しいチームを作成しましょう
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {filteredTeams.map((team) => (
                    <TeamRow key={team.id} team={team} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/teams/create')}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

function TeamRow({ team, isMyTeam }: { team: Team; isMyTeam?: boolean }) {
  return (
    <li>
      <Link
        to={`/teams/${team.id}`}
        className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
      >
        {/* Avatar */}
        <Avatar src={team.iconImage} alt={team.name} size="lg" />

        {/* Team Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {team.name}
            </h3>
            {isMyTeam && (
              <Crown size={14} className="text-yellow-500 flex-shrink-0" />
            )}
          </div>

          {/* Description */}
          {team.description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
              {team.description}
            </p>
          )}

          {/* Member count */}
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-1">
            <Users size={12} className="text-[var(--primary)]" />
            <span>{team.memberCount}人</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
