import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/PageHeader';
import { Breadcrumb } from '@/components/Breadcrumb';

const REGIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

export function CreateTeamPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [iconImage, setIconImage] = useState('');
  const [headerImage, setHeaderImage] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [lineUrl, setLineUrl] = useState('');
  const visibility = 'public'; // デフォルトで全体公開

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.uploadProfileImage(file);
      setIconImage(result.imageUrl);
    } catch (error) {
      console.error('Failed to upload icon:', error);
    }
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.uploadProfileImage(file);
      setHeaderImage(result.imageUrl);
    } catch (error) {
      console.error('Failed to upload header:', error);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('サークル名を入力してください');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const newTeam = await api.createTeam({
        name,
        description: description || ' ', // API requires description
        visibility,
        region: region || undefined,
        iconImage: iconImage || undefined,
        headerImage: headerImage || undefined,
        instagramUrl: instagramUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        tiktokUrl: tiktokUrl || undefined,
        lineUrl: lineUrl || undefined,
      } as any);
      navigate(`/teams/${newTeam.id}`);
    } catch (err: any) {
      console.error('Failed to create team:', err);
      setError(err.message || 'サークルの作成に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 16px', background: '#F5F5F7' }}>
        <Breadcrumb
          items={[
            { label: 'サークル', href: '/teams' },
            { label: '新規作成' }
          ]}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '120px' }}>
        {/* Team Icon */}
        <div style={{ marginBottom: '24px' }}>
          <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
            サークルアイコン
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
              <label
                className="flex items-center gap-2 text-[var(--primary)] font-medium cursor-pointer"
                style={{ marginTop: '12px' }}
              >
                <Image size={18} />
                <span>画像を追加</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
              </label>
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
              <label
                className="flex items-center gap-2 text-[var(--primary)] font-medium cursor-pointer"
                style={{ marginTop: '12px' }}
              >
                <Image size={18} />
                <span>ヘッダー画像を追加</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div style={{ marginBottom: '24px' }}>
          <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
            サークル情報
          </label>
          <div className="bg-white rounded-xl overflow-hidden">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="サークル名 *"
              className="w-full border-b border-gray-100 focus:outline-none"
              style={{ padding: '14px 16px' }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="サークルの説明"
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

        {/* SNS Links */}
        <div style={{ marginBottom: '24px' }}>
          <div className="bg-white rounded-xl" style={{ padding: '16px' }}>
            <h3 className="font-bold" style={{ marginBottom: '16px' }}>SNSリンク</h3>

            {/* Instagram */}
            <div style={{ marginBottom: '16px' }}>
              <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
                Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/username"
                className="w-full border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
                style={{ padding: '12px 16px' }}
              />
            </div>

            {/* X (Twitter) */}
            <div style={{ marginBottom: '16px' }}>
              <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
                X (Twitter)
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://x.com/username"
                className="w-full border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
                style={{ padding: '12px 16px' }}
              />
            </div>

            {/* TikTok */}
            <div style={{ marginBottom: '16px' }}>
              <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
                TikTok
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@username"
                className="w-full border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
                style={{ padding: '12px 16px' }}
              />
            </div>

            {/* LINE */}
            <div>
              <label className="block text-sm text-gray-500" style={{ marginBottom: '8px' }}>
                LINE
              </label>
              <input
                type="url"
                value={lineUrl}
                onChange={(e) => setLineUrl(e.target.value)}
                placeholder="https://line.me/ti/p/..."
                className="w-full border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
                style={{ padding: '12px 16px' }}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl" style={{ padding: '12px 16px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={isSaving || !name.trim()}
          className="w-full font-medium rounded-xl text-white disabled:opacity-50"
          style={{ padding: '14px', backgroundColor: 'var(--primary)' }}
        >
          {isSaving ? '作成中...' : 'サークルを作成'}
        </button>
      </div>
    </div>
  );
}
