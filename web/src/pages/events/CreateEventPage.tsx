import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui';
import { PREFECTURE_OPTIONS } from '@/lib/prefectures';

const SKILL_LEVELS = [
  { value: 'beginner', label: '🟢 初心者' },
  { value: 'intermediate', label: '🟡 中級者' },
  { value: 'advanced', label: '🔴 上級者' },
];

export function CreateEventPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    region: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    skillLevel: 'beginner',
    price: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await api.createEvent({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        region: formData.region,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        maxParticipants: parseInt(formData.maxParticipants),
        skillLevel: formData.skillLevel as 'beginner' | 'intermediate' | 'advanced',
        price: formData.price ? parseInt(formData.price) : undefined,
      });
      navigate('/events');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold ml-2">イベント作成</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Card>
          <CardContent className="p-4">
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

              <Input
                label="場所"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="開催場所"
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
                <Input
                  label="開始日時"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="終了日時"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleChange}
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
                  required
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

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                イベントを作成
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
