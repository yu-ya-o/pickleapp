import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardContent, Button, Input, Loading, Avatar } from '@/components/ui';
import { formatDateTime, getSkillLevelEmoji, getSkillLevelLabel, getDisplayName } from '@/lib/utils';
import { PREFECTURES } from '@/lib/prefectures';
import type { Event } from '@/types';

export function EventsListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    loadEvents();
  }, [selectedRegion]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEvents({
        status: 'active',
        upcoming: true,
        region: selectedRegion || undefined,
      });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">イベント</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">近くのピックルボールイベントを見つけよう</p>
            </div>
            <Button
              variant="gradient"
              onClick={() => navigate('/events/create')}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">イベント作成</span>
              <span className="sm:hidden">作成</span>
            </Button>
          </div>

          {/* Search and Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                placeholder="イベントを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-[var(--muted)] border-0 focus:bg-white focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Region Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <button
                onClick={() => setSelectedRegion('')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !selectedRegion
                    ? 'gradient-bg text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-[var(--muted-foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] border border-[var(--border)]'
                }`}
              >
                全国
              </button>
              {PREFECTURES.slice(0, 10).map((pref) => (
                <button
                  key={pref}
                  onClick={() => setSelectedRegion(pref)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedRegion === pref
                      ? 'gradient-bg text-white shadow-md shadow-purple-500/20'
                      : 'bg-white text-[var(--muted-foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] border border-[var(--border)]'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading size="lg" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-[var(--primary)]" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">イベントがありません</h3>
            <p className="text-[var(--muted-foreground)] mb-6">新しいイベントを作成してみましょう！</p>
            <Button variant="gradient" onClick={() => navigate('/events/create')}>
              <Plus size={18} className="mr-2" />
              イベントを作成
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event, index) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="h-full group">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <Avatar
                        src={event.creator.profileImage}
                        alt={getDisplayName(event.creator)}
                        size="lg"
                        className="ring-2 ring-[var(--border)] group-hover:ring-[var(--primary)]"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] mb-2 truncate group-hover:text-[var(--primary)] transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                            <Calendar size={14} className="text-[var(--primary)]" />
                            <span>{formatDateTime(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                            <MapPin size={14} className="text-[var(--secondary)]" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--muted)] rounded-full text-sm">
                        {getSkillLevelEmoji(event.skillLevel)}{' '}
                        <span className="text-[var(--muted-foreground)]">{getSkillLevelLabel(event.skillLevel)}</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users size={14} className="text-[var(--accent)]" />
                        <span className="font-medium text-[var(--foreground)]">
                          {event.maxParticipants - event.availableSpots}
                        </span>
                        <span className="text-[var(--muted-foreground)]">/ {event.maxParticipants}</span>
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
