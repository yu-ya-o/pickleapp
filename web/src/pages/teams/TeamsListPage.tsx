import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MapPin } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardContent, Button, Input, Loading, Avatar, Badge } from '@/components/ui';
import { PREFECTURES } from '@/lib/prefectures';
import type { Team } from '@/types';

export function TeamsListPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

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

  const displayTeams = activeTab === 'my' ? myTeams : teams;
  const filteredTeams = displayTeams.filter((team) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">チーム</h1>
            <Button
              size="sm"
              onClick={() => navigate('/teams/create')}
              className="flex items-center gap-1"
            >
              <Plus size={18} />
              作成
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-gray-400'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`pb-2 font-medium transition-colors ${
                activeTab === 'my'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-gray-400'
              }`}
            >
              参加中
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="チームを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Region Filter */}
          {activeTab === 'all' && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedRegion('')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedRegion
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全国
              </button>
              {PREFECTURES.slice(0, 10).map((pref) => (
                <button
                  key={pref}
                  onClick={() => setSelectedRegion(pref)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedRegion === pref
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {activeTab === 'my' ? '参加中のチームがありません' : 'チームがありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar
                        src={team.iconImage}
                        alt={team.name}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate">
                            {team.name}
                          </h3>
                          {team.visibility === 'private' && (
                            <Badge variant="default">非公開</Badge>
                          )}
                        </div>
                        {team.description && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {team.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {team.region && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{team.region}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{team.memberCount} 人</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
