import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Calendar, Users } from 'lucide-react';
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
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">イベント</h1>
            <Button
              size="sm"
              onClick={() => navigate('/events/create')}
              className="flex items-center gap-1"
            >
              <Plus size={18} />
              作成
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="イベントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Region Filter */}
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
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">イベントがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar
                        src={event.creator.profileImage}
                        alt={getDisplayName(event.creator)}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar size={14} />
                          <span>{formatDateTime(event.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <MapPin size={14} />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {getSkillLevelEmoji(event.skillLevel)}{' '}
                              {getSkillLevelLabel(event.skillLevel)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users size={14} />
                            <span>
                              {event.maxParticipants - event.availableSpots}/
                              {event.maxParticipants}
                            </span>
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
