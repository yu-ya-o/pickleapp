import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { PageHeader } from '@/components/PageHeader';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Input, Textarea, Select, LocationAutocomplete, Loading, DateTimeInput } from '@/components/ui';
import { PREFECTURE_OPTIONS } from '@/lib/prefectures';
import type { Team } from '@/types';

const SKILL_LEVELS = [
  { value: 'all', label: '全レベル' },
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '全体公開' },
  { value: 'private', label: 'チームのみ公開' },
];

type OrganizerType = 'personal' | { teamId: string };

export function CreateEventPage() {
  const navigate = useNavigate();
  const { id: editId, teamId: urlTeamId } = useParams<{ id: string; teamId: string }>();
  const location = useLocation();
  const duplicateId = new URLSearchParams(location.search).get('duplicate');

  const isEditMode = !!editId;
  const isDuplicateMode = !!duplicateId;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode || isDuplicateMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [eligibleTeams, setEligibleTeams] = useState<Team[]>([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrganizerType>(
    urlTeamId ? { teamId: urlTeamId } : 'personal'
  );
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
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

  // Load eligible teams (owner or admin)
  useEffect(() => {
    const loadEligibleTeams = async () => {
      try {
        const myTeams = await api.getTeams({ myTeams: true });
        const filtered = myTeams.filter(
          (team) => team.userRole === 'owner' || team.userRole === 'admin'
        );
        setEligibleTeams(filtered);
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };
    loadEligibleTeams();
  }, []);

  // Load event data for edit or duplicate mode
  useEffect(() => {
    const eventIdToLoad = editId || duplicateId;
    if (eventIdToLoad) {
      loadEventData(eventIdToLoad);
    }
  }, [editId, duplicateId]);

  const loadEventData = async (eventId: string) => {
    try {
      setIsLoadingEvent(true);

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

      // Use team event API when urlTeamId is present (team event duplication)
      if (urlTeamId) {
        const teamEvent = await api.getTeamEvent(urlTeamId, eventId);
        setFormData({
          title: teamEvent.title,
          description: teamEvent.description || '',
          location: teamEvent.location,
          address: teamEvent.address || '',
          latitude: teamEvent.latitude || null,
          longitude: teamEvent.longitude || null,
          region: teamEvent.region,
          startTime: formatDateTimeLocal(teamEvent.startTime),
          endTime: formatDateTimeLocal(teamEvent.endTime),
          maxParticipants: teamEvent.maxParticipants ? String(teamEvent.maxParticipants) : '',
          skillLevel: teamEvent.skillLevel || 'all',
          price: teamEvent.price ? String(teamEvent.price) : '',
        });
        setVisibility(teamEvent.visibility || 'public');
      } else {
        const event = await api.getEvent(eventId);
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
          maxParticipants: String(event.maxParticipants),
          skillLevel: event.skillLevel || 'all',
          price: event.price ? String(event.price) : '',
        });
      }
    } catch (error) {
      console.error('Failed to load event:', error);
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

  const handleOrganizerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'personal') {
      setSelectedOrganizer('personal');
    } else {
      setSelectedOrganizer({ teamId: value });
    }
  };

  const isTeamEvent = selectedOrganizer !== 'personal';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // バリデーション
    if (!formData.startTime || !formData.endTime) {
      setErrorMessage('開始日時と終了日時を選択してください');
      return;
    }

    try {
      setIsLoading(true);

      if (isTeamEvent && typeof selectedOrganizer === 'object') {
        // チームイベント作成
        const teamEventData = {
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
          visibility: visibility,
        };

        const newEvent = await api.createTeamEvent(selectedOrganizer.teamId, teamEventData);
        navigate(`/teams/${selectedOrganizer.teamId}/events/${newEvent.id}`);
      } else {
        // 個人イベント作成/編集
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
          maxParticipants: parseInt(formData.maxParticipants) || 999,
          skillLevel: formData.skillLevel as 'all' | 'beginner' | 'intermediate' | 'advanced',
          price: formData.price ? parseInt(formData.price) : undefined,
        };

        if (isEditMode && editId) {
          await api.updateEvent(editId, eventData);
          navigate(`/events/${editId}`);
        } else {
          const newEvent = await api.createEvent(eventData);
          navigate(`/events/${newEvent.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      setErrorMessage('イベントの保存に失敗しました。入力内容を確認してください。');
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

  // Build organizer options
  const organizerOptions = [
    { value: 'personal', label: '自分' },
    ...eligibleTeams.map((team) => ({
      value: team.id,
      label: team.name,
    })),
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 16px', background: '#F5F5F7' }}>
        <Breadcrumb
          items={[
            { label: 'イベント', href: '/events' },
            { label: isEditMode ? '編集' : isDuplicateMode ? '複製' : '新規作成' }
          ]}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 主催者選択 - 新規作成時のみ表示 */}
          {!isEditMode && (
            <Select
              label="主催者"
              name="organizer"
              value={typeof selectedOrganizer === 'string' ? selectedOrganizer : selectedOrganizer.teamId}
              onChange={handleOrganizerChange}
              options={organizerOptions}
            />
          )}

          {/* 公開範囲 - チームイベント時のみ表示 */}
          {isTeamEvent && (
            <Select
              label="公開範囲"
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              options={VISIBILITY_OPTIONS}
            />
          )}

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
              placeholder={isTeamEvent ? '任意' : '例: 8'}
              required={!isTeamEvent}
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

          {errorMessage && (
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
          )}

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
