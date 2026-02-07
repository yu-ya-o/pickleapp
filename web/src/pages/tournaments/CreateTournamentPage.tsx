import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { PageHeader } from '@/components/PageHeader';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Input, Textarea, Loading, LocationAutocomplete } from '@/components/ui';

export function CreateTournamentPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = !!editId;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTournament, setIsLoadingTournament] = useState(isEditMode);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    organizer: '',
    venue: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    events: '',
    matchFormat: '',
    applicationDeadline: '',
    entryFee: '',
    paymentMethod: '',
    tournamentUrl: '',
    contactInfo: '',
    snsTwitter: '',
    snsInstagram: '',
    snsLine: '',
  });

  useEffect(() => {
    if (editId) {
      loadTournamentData(editId);
    }
  }, [editId]);

  const loadTournamentData = async (id: string) => {
    try {
      setIsLoadingTournament(true);
      const tournament = await api.getTournament(id);
      setFormData({
        title: tournament.title,
        description: tournament.description,
        eventDate: tournament.eventDate,
        organizer: tournament.organizer,
        venue: tournament.venue,
        address: tournament.address || '',
        latitude: tournament.latitude || null,
        longitude: tournament.longitude || null,
        events: tournament.events,
        matchFormat: tournament.matchFormat,
        applicationDeadline: tournament.applicationDeadline,
        entryFee: tournament.entryFee,
        paymentMethod: tournament.paymentMethod,
        tournamentUrl: tournament.tournamentUrl || '',
        contactInfo: tournament.contactInfo || '',
        snsTwitter: tournament.snsUrls?.twitter || '',
        snsInstagram: tournament.snsUrls?.instagram || '',
        snsLine: tournament.snsUrls?.line || '',
      });
    } catch (error) {
      console.error('Failed to load tournament:', error);
    } finally {
      setIsLoadingTournament(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      venue: locationData.name,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const snsUrls: { twitter?: string; instagram?: string; line?: string } = {};
      if (formData.snsTwitter) snsUrls.twitter = formData.snsTwitter;
      if (formData.snsInstagram) snsUrls.instagram = formData.snsInstagram;
      if (formData.snsLine) snsUrls.line = formData.snsLine;

      const data = {
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        organizer: formData.organizer,
        venue: formData.venue,
        address: formData.address || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        events: formData.events,
        matchFormat: formData.matchFormat,
        applicationDeadline: formData.applicationDeadline,
        entryFee: formData.entryFee,
        paymentMethod: formData.paymentMethod,
        tournamentUrl: formData.tournamentUrl || undefined,
        contactInfo: formData.contactInfo,
        snsUrls: Object.keys(snsUrls).length > 0 ? snsUrls : undefined,
      };

      if (isEditMode && editId) {
        await api.updateTournament(editId, data);
        navigate(`/tournaments/${editId}`);
      } else {
        const newTournament = await api.createTournament(data);
        navigate(`/tournaments/${newTournament.id}`);
      }
    } catch (error) {
      console.error('Failed to save tournament:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const submitLabel = isEditMode ? '保存する' : '大会を作成';

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 16px', background: '#F5F5F7' }}>
        <Breadcrumb
          items={[
            { label: '大会', href: '/tournaments' },
            { label: isEditMode ? '編集' : '新規作成' }
          ]}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="大会名"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="例: 第1回 PickleHub オープン"
            required
          />

          <Textarea
            label="大会概要"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="大会の概要を入力..."
            required
          />

          <Input
            label="開催日"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            placeholder="例: 2026年3月15日（日）"
            required
          />

          <Input
            label="主催"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            placeholder="例: PickleHub運営事務局"
            required
          />

          <LocationAutocomplete
            label="会場"
            value={formData.venue}
            onChange={handleLocationChange}
            onInputChange={(value) => setFormData((prev) => ({ ...prev, venue: value }))}
            placeholder="会場を検索..."
            required
          />

          <Textarea
            label="種目"
            name="events"
            value={formData.events}
            onChange={handleChange}
            placeholder={"例:\n男子ダブルス\n女子ダブルス\nミックスダブルス"}
            required
          />

          <Textarea
            label="試合形式"
            name="matchFormat"
            value={formData.matchFormat}
            onChange={handleChange}
            placeholder={"例:\n総当たりリーグ戦 → 決勝トーナメント\n11点マッチ\nデュースなし"}
            required
          />

          <Input
            label="申込期限"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            placeholder="例: 2026年3月1日（土）23:59まで"
            required
          />

          <Textarea
            label="参加費用"
            name="entryFee"
            value={formData.entryFee}
            onChange={handleChange}
            placeholder={"例:\n1人 3,000円（税込）\nペアあたりの金額です"}
            required
          />

          <Textarea
            label="支払方法"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            placeholder={"例:\n当日現金払い\n事前振込も可"}
            required
          />

          <Input
            label="大会URL"
            name="tournamentUrl"
            value={formData.tournamentUrl}
            onChange={handleChange}
            placeholder="例: https://example.com/tournament"
          />

          <Input
            label="問合せ先"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="例: example@email.com"
          />

          {/* SNS Section */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>SNS</p>
            <div className="space-y-3">
              <Input
                label="X (Twitter)"
                name="snsTwitter"
                value={formData.snsTwitter}
                onChange={handleChange}
                placeholder="例: https://x.com/username"
              />
              <Input
                label="Instagram"
                name="snsInstagram"
                value={formData.snsInstagram}
                onChange={handleChange}
                placeholder="例: https://instagram.com/username"
              />
              <Input
                label="LINE"
                name="snsLine"
                value={formData.snsLine}
                onChange={handleChange}
                placeholder="例: https://line.me/..."
              />
            </div>
          </div>

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
