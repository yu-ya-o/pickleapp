import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Breadcrumb } from '@/components/Breadcrumb';

const regions = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const experiences = ['6ヶ月未満', '6ヶ月〜1年', '1〜2年', '2〜3年', '3年以上'];
const genders = ['男性', '女性', '回答しない'];
const ageGroups = ['10代', '20代', '30代', '40代', '50代', '60代', '70代', '80代', '90代'];
const skillLevels = [
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' }
];

interface BattleRecord {
  id: string;
  tournamentName: string;
  yearMonth: string;
  result: string;
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [region, setRegion] = useState(user?.region || '');
  const [pickleballExperience, setPickleballExperience] = useState(user?.pickleballExperience || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || '');
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || '');
  const [duprSingles, setDuprSingles] = useState(user?.duprSingles?.toString() || '');
  const [duprDoubles, setDuprDoubles] = useState(user?.duprDoubles?.toString() || '');
  const [myPaddle, setMyPaddle] = useState(user?.myPaddle || '');
  const [instagramUrl, setInstagramUrl] = useState(user?.instagramUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(user?.twitterUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(user?.tiktokUrl || '');
  const [lineUrl, setLineUrl] = useState(user?.lineUrl || '');
  const [battleRecords, setBattleRecords] = useState<BattleRecord[]>(
    (user as any)?.battleRecords?.length > 0
      ? (user as any).battleRecords
      : [{ id: crypto.randomUUID(), tournamentName: '', yearMonth: '', result: '' }]
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDUPRInput = (value: string) => {
    if (!value) return '';
    const filtered = value.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length === 1) return parts[0];
    return `${parts[0]}.${parts[1].slice(0, 3)}`;
  };

  const addBattleRecord = () => {
    setBattleRecords([...battleRecords, { id: crypto.randomUUID(), tournamentName: '', yearMonth: '', result: '' }]);
  };

  const removeBattleRecord = (id: string) => {
    if (battleRecords.length > 1) {
      setBattleRecords(battleRecords.filter(r => r.id !== id));
    }
  };

  const updateBattleRecord = (id: string, field: keyof BattleRecord, value: string) => {
    setBattleRecords(battleRecords.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let profileImageUrl = user?.profileImage;

      // Upload image if selected
      if (selectedFile) {
        const uploadResult = await api.uploadProfileImage(selectedFile);
        profileImageUrl = uploadResult.imageUrl;
      }

      // Filter out empty battle records
      const validBattleRecords = battleRecords.filter(r => r.tournamentName.trim() !== '');

      await api.updateProfile({
        nickname: nickname || undefined,
        bio: bio || undefined,
        region: region || undefined,
        pickleballExperience: pickleballExperience || undefined,
        gender: gender || undefined,
        ageGroup: ageGroup || undefined,
        skillLevel: skillLevel || undefined,
        duprSingles: duprSingles ? parseFloat(duprSingles) : undefined,
        duprDoubles: duprDoubles ? parseFloat(duprDoubles) : undefined,
        myPaddle: myPaddle || undefined,
        profileImage: profileImageUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        tiktokUrl: tiktokUrl || undefined,
        lineUrl: lineUrl || undefined,
        battleRecords: validBattleRecords.length > 0 ? validBattleRecords : undefined,
      } as any);

      await refreshUser();
      navigate('/profile');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = nickname && region && pickleballExperience && gender && ageGroup && skillLevel;

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {/* Breadcrumb */}
        <div style={{ padding: '12px 16px' }}>
          <Breadcrumb
            items={[
              { label: 'プロフィール', href: '/profile' },
              { label: '編集' }
            ]}
          />
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 12px'
        }}>
          <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#1a1a2e' }}>
            プロフィール編集
          </h1>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
              color: isFormValid && !isLoading ? '#667eea' : '#9ca3af',
              fontSize: '15px',
              fontWeight: 600
            }}
          >
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#DC2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Profile Image */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#888', marginBottom: '16px' }}>
            プロフィール画像
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#F5F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {previewImage || user.profileImage ? (
                <img
                  src={previewImage || user.profileImage || ''}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '40px' }}>👤</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F5F5F7',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                color: '#667eea',
                fontSize: '14px'
              }}
            >
              <Camera size={16} />
              画像を選択
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#888', marginBottom: '16px' }}>
            基本情報
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              ニックネーム <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ニックネームを入力"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="自己紹介を入力"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                resize: 'none'
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'right', marginTop: '4px' }}>
              {bio.length}/200
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              地域 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                background: '#FFFFFF'
              }}
            >
              <option value="">選択してください</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Pickleball Info */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#888', marginBottom: '16px' }}>
            ピックルボールについて
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              ピックルボール歴 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={pickleballExperience}
              onChange={(e) => setPickleballExperience(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                background: '#FFFFFF'
              }}
            >
              <option value="">選択してください</option>
              {experiences.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              レベル <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                background: '#FFFFFF'
              }}
            >
              <option value="">選択してください</option>
              {skillLevels.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
                DUPR シングルス
              </label>
              <input
                type="text"
                value={duprSingles}
                onChange={(e) => setDuprSingles(formatDUPRInput(e.target.value))}
                placeholder="例: 4.500"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
                DUPR ダブルス
              </label>
              <input
                type="text"
                value={duprDoubles}
                onChange={(e) => setDuprDoubles(formatDUPRInput(e.target.value))}
                placeholder="例: 4.500"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              使用パドル
            </label>
            <input
              type="text"
              value={myPaddle}
              onChange={(e) => setMyPaddle(e.target.value.slice(0, 100))}
              placeholder="例: JOOLA Ben Johns Hyperion"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Other Info */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#888', marginBottom: '16px' }}>
            その他
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              性別 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                background: '#FFFFFF'
              }}
            >
              <option value="">選択してください</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              年代 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                background: '#FFFFFF'
              }}
            >
              <option value="">選択してください</option>
              {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Battle Records */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#888', marginBottom: '16px' }}>
            戦歴
          </h2>

          {battleRecords.map((record, index) => (
            <div key={record.id} style={{
              padding: '12px',
              background: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>戦歴 {index + 1}</span>
                {battleRecords.length > 1 && (
                  <button
                    onClick={() => removeBattleRecord(record.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#EF4444'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={record.tournamentName}
                onChange={(e) => updateBattleRecord(record.id, 'tournamentName', e.target.value)}
                placeholder="大会名"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '8px'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={record.yearMonth}
                  onChange={(e) => updateBattleRecord(record.id, 'yearMonth', e.target.value)}
                  placeholder="年月 (例: 2025/01)"
                  style={{
                    padding: '10px',
                    border: '1px solid #E5E5E5',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={record.result}
                  onChange={(e) => updateBattleRecord(record.id, 'result', e.target.value)}
                  placeholder="結果 (例: 優勝)"
                  style={{
                    padding: '10px',
                    border: '1px solid #E5E5E5',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addBattleRecord}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#667eea',
              fontSize: '14px',
              padding: '8px 0'
            }}
          >
            <Plus size={16} />
            戦歴を追加
          </button>
        </div>

        {/* SNS Links */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#888', marginBottom: '16px' }}>
            SNSリンク
          </h2>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              Instagram
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              X (Twitter)
            </label>
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://x.com/username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              TikTok
            </label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://tiktok.com/@username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              LINE
            </label>
            <input
              type="url"
              value={lineUrl}
              onChange={(e) => setLineUrl(e.target.value)}
              placeholder="https://line.me/ti/p/..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
