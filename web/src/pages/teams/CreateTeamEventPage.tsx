import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Input, Textarea, Select, LocationAutocomplete, Loading, DateTimeInput } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PREFECTURE_OPTIONS } from '@/lib/prefectures';

const SKILL_LEVELS = [
  { value: 'all', label: '全レベル' },
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' },
];

export function CreateTeamEventPage() {
  const navigate = useNavigate();
  const { teamId, eventId } = useParams<{ teamId: string; eventId: string }>();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');

  const isEditMode = !!eventId;
  const isDuplicateMode = !!duplicateId;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode || isDuplicateMode);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    region: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    skillLevel: 'all',
    price: '',
  });

  // Load event data for edit or duplicate mode
  useEffect(() => {
    const eventIdToLoad = eventId || duplicateId;
    if (eventIdToLoad && teamId) {
      loadEventData(eventIdToLoad);
    }
  }, [teamId, eventId, duplicateId]);

  const loadEventData = async (loadEventId: string) => {
    try {
      setIsLoadingEvent(true);
      const event = await api.getTeamEvent(teamId!, loadEventId);

      // Format datetime for input fields (local time)
      const formatDateTimeLocal = (isoString: string) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: event.title,
        description: event.description || '',
        location: event.location,
        address: event.address || '',
        latitude: event.latitude || null,
        longitude: event.longitude || null,
        region: event.region,
        startTime: formatDateTimeLocal(event.startTime),
        endTime: formatDateTimeLocal(event.endTime),
        maxParticipants: event.maxParticipants ? String(event.maxParticipants) : '',
        skillLevel: event.skillLevel || 'all',
        price: event.price ? String(event.price) : '',
      });
    } catch (error) {
      console.error('Failed to load team event:', error);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLocationChange = (locationData: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      location: locationData.name,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId) return;

    try {
      setIsLoading(true);
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        region: formData.region,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        skillLevel: formData.skillLevel as 'all' | 'beginner' | 'intermediate' | 'advanced',
        price: formData.price ? parseInt(formData.price) : undefined,
      };

      if (isEditMode && eventId) {
        await api.updateTeamEvent(teamId, eventId, eventData);
        navigate(`/teams/${teamId}/events/${eventId}`);
      } else {
        const newEvent = await api.createTeamEvent(teamId, eventData);
        navigate(`/teams/${teamId}/events/${newEvent.id}`);
      }
    } catch (error) {
      console.error('Failed to save team event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const submitLabel = isEditMode ? '保存する' : 'イベントを作成';

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 16px', background: '#F5F5F7' }}>
        <Breadcrumb
          items={[
            { label: 'サークル', href: '/teams' },
            { label: 'サークル', href: `/teams/${teamId}` },
            { label: 'イベント', href: `/teams/${teamId}/events` },
            { label: isEditMode ? '編集' : isDuplicateMode ? '複製' : '新規作成' }
          ]}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="タイトル"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="イベントのタイトル"
            required
          />

          <Textarea
            label="説明"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="イベントの詳細を入力..."
          />

          <LocationAutocomplete
            label="場所"
            value={formData.location}
            onChange={handleLocationChange}
            onInputChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
            placeholder="開催場所を検索..."
            required
          />

          <Select
            label="地域"
            name="region"
            value={formData.region}
            onChange={handleChange}
            options={PREFECTURE_OPTIONS}
            placeholder="地域を選択"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <DateTimeInput
              label="開始日時"
              value={formData.startTime}
              onChange={(value) => setFormData((prev) => ({ ...prev, startTime: value }))}
              required
            />
            <DateTimeInput
              label="終了日時"
              value={formData.endTime}
              onChange={(value) => setFormData((prev) => ({ ...prev, endTime: value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="定員"
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="例: 8"
            />
            <Input
              label="参加費（円）"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="任意"
            />
          </div>

          <Select
            label="スキルレベル"
            name="skillLevel"
            value={formData.skillLevel}
            onChange={handleChange}
            options={SKILL_LEVELS}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-medium rounded-xl disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)', padding: '14px' }}
          >
            {isLoading ? '保存中...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
