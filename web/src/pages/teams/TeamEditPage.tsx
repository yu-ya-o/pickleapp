import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image } from 'lucide-react';
import { api } from '@/services/api';
import { Loading } from '@/components/ui';
import type { Team } from '@/types';

const REGIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

export function TeamEditPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [iconImage, setIconImage] = useState('');
  const [headerImage, setHeaderImage] = useState('');

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTeam(teamId!);
      setTeam(data);
      setName(data.name);
      setDescription(data.description || '');
      setRegion(data.region || '');
      setIconImage(data.iconImage || '');
      setHeaderImage(data.headerImage || '');
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teamId) return;
    try {
      setIsSaving(true);
      await api.updateTeam(teamId, {
        name,
        description,
        region,
        iconImage,
        headerImage,
      });
      navigate(-1);
    } catch (error) {
      console.error('Failed to update team:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">チームが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--primary)] font-medium"
          >
            キャンセル
          </button>
          <h1 className="font-semibold text-lg">チームを編集</h1>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="text-[var(--primary)] font-medium disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {/* Team Icon */}
        <div style={{ marginBottom: '24px' }}>
          <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
            チームアイコン
          </label>
          <div className="bg-white rounded-xl" style={{ padding: '20px' }}>
            <div className="flex flex-col items-center">
              {iconImage ? (
                <img
                  src={iconImage}
                  alt="Team icon"
                  className="rounded-full object-cover"
                  style={{ width: '100px', height: '100px' }}
                />
              ) : (
                <div
                  className="rounded-full bg-gray-200 flex items-center justify-center"
                  style={{ width: '100px', height: '100px' }}
                >
                  <Image size={40} className="text-gray-400" />
                </div>
              )}
              <button
                className="flex items-center gap-2 text-[var(--primary)] font-medium"
                style={{ marginTop: '12px' }}
              >
                <Image size={18} />
                <span>画像を変更</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header Image */}
        <div style={{ marginBottom: '24px' }}>
          <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
            ヘッダー画像
          </label>
          <div className="bg-white rounded-xl" style={{ padding: '20px' }}>
            <div className="flex flex-col items-center">
              {headerImage ? (
                <img
                  src={headerImage}
                  alt="Header"
                  className="rounded-xl object-cover w-full"
                  style={{ height: '120px' }}
                />
              ) : (
                <div
                  className="rounded-xl bg-gray-200 flex items-center justify-center w-full"
                  style={{ height: '120px' }}
                >
                  <Image size={40} className="text-gray-400" />
                </div>
              )}
              <button
                className="flex items-center gap-2 text-[var(--primary)] font-medium"
                style={{ marginTop: '12px' }}
              >
                <Image size={18} />
                <span>ヘッダー画像を変更</span>
              </button>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div style={{ marginBottom: '24px' }}>
          <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
            チーム情報
          </label>
          <div className="bg-white rounded-xl overflow-hidden">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="チーム名"
              className="w-full border-b border-gray-100 focus:outline-none"
              style={{ padding: '14px 16px' }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="チームの説明"
              rows={4}
              className="w-full resize-none focus:outline-none"
              style={{ padding: '14px 16px' }}
            />
          </div>
        </div>

        {/* Region */}
        <div style={{ marginBottom: '24px' }}>
          <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
            地域
          </label>
          <div className="bg-white rounded-xl">
            <div
              className="flex items-center justify-between"
              style={{ padding: '14px 16px' }}
            >
              <span>都道府県を選択</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="text-[var(--primary)] font-medium focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="">選択してください</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
