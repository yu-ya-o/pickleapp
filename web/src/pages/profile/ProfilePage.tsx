import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Users,
  Hash,
  Trophy,
  ChevronRight,
  Share2,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button, Avatar, Modal } from '@/components/ui';
import { getDisplayName, getSkillLevelLabel } from '@/lib/utils';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.deleteAccount();
      signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  // 仮の戦績データ
  const battleRecords = [
    { id: 1, date: '2025/12', tournament: '福岡オープン', result: '3位', medal: '🥉' },
    { id: 2, date: '2025/11', tournament: '初心者大会', result: '優勝', medal: '🥇' },
  ];

  // 仮のSNSデータ
  const snsLinks = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, url: 'https://instagram.com/example', color: '#E4405F', bgColor: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' },
    { id: 'twitter', name: 'X (Twitter)', icon: null, url: 'https://x.com/example', color: '#000000', bgColor: '#000000' },
    { id: 'tiktok', name: 'TikTok', icon: null, url: 'https://tiktok.com/@example', color: '#000000', bgColor: '#000000' },
    { id: 'line', name: 'LINE', icon: null, url: 'https://line.me/example', color: '#06C755', bgColor: '#06C755' },
  ];

  const profileItems = [
    { icon: MapPin, label: '地域', value: user.region || '-' },
    { icon: Clock, label: 'ピックルボール歴', value: user.pickleballExperience || '-' },
    { icon: Star, label: 'レベル', value: user.skillLevel ? getSkillLevelLabel(user.skillLevel) : '-' },
    { icon: TrendingUp, label: 'DUPR', value: user.duprDoubles || user.duprSingles ? `${user.duprSingles || '-'} / ${user.duprDoubles || '-'}` : '-' },
    { icon: Users, label: '性別', value: user.gender || '-' },
    { icon: Hash, label: '年代', value: user.ageGroup || '-' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        <div style={{ width: '40px' }} />
        <h1 style={{
          fontSize: '18px',
          fontWeight: 600,
        }}>
          マイプロフィール
        </h1>
        <button
          onClick={() => {/* TODO: Share */}}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <Share2 size={20} style={{ color: '#6B7280' }} />
        </button>
      </header>

      {/* Content */}
      <div style={{ paddingBottom: '100px' }}>
        {/* Profile Header - Centered */}
        <div style={{
          padding: '32px 16px 24px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Large Profile Image */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '60px',
            overflow: 'hidden',
            marginBottom: '16px',
            border: '4px solid #F3F4F6'
          }}>
            <Avatar
              src={user.profileImage}
              alt={getDisplayName(user)}
              size="xl"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Name */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '8px'
          }}>
            {getDisplayName(user)}
          </h2>

          {/* Quick Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6B7280',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <span>📍 {user.region || '未設定'}</span>
            <span>•</span>
            <span>🏓 {user.skillLevel ? getSkillLevelLabel(user.skillLevel) : '未設定'}</span>
          </div>

          {/* Bio */}
          {user.bio && (
            <p style={{
              fontSize: '14px',
              color: '#4B5563',
              lineHeight: '1.6',
              maxWidth: '300px'
            }}>
              {user.bio}
            </p>
          )}
        </div>

        {/* 戦績セクション */}
        <div style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Trophy size={20} style={{ color: '#F59E0B' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>
              戦績
            </h3>
          </div>
          <div style={{
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {battleRecords.map((record, index) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: index !== battleRecords.length - 1 ? '1px solid #E5E7EB' : 'none'
                }}
              >
                <span style={{ fontSize: '24px', marginRight: '12px' }}>{record.medal}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>
                    {record.tournament}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>
                    {record.date}
                  </p>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: record.result === '優勝' ? '#F59E0B' : '#6B7280'
                }}>
                  {record.result}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '8px', backgroundColor: '#F3F4F6' }} />

        {/* Profile Info Section */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: '12px'
          }}>
            プロフィール情報
          </h3>
          <div style={{
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {profileItems.map((item, index) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: index !== profileItems.length - 1 ? '1px solid #E5E7EB' : 'none'
                }}
              >
                <item.icon size={20} style={{ color: '#3B82F6', flexShrink: 0 }} />
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  marginLeft: '12px',
                  width: '120px',
                  flexShrink: 0
                }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '8px', backgroundColor: '#F3F4F6' }} />

        {/* SNS Links Section */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: '12px'
          }}>
            SNS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {snsLinks.map((sns) => (
              <a
                key={sns.id}
                href={sns.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: '15px',
                  background: sns.bgColor,
                  gap: '8px'
                }}
              >
                {sns.id === 'instagram' && <Instagram size={20} />}
                {sns.id === 'twitter' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )}
                {sns.id === 'tiktok' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                )}
                {sns.id === 'line' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                )}
                <span>{sns.name}</span>
                <ExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.7 }} />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '8px', backgroundColor: '#F3F4F6' }} />

        {/* Action Buttons */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px' }}>
          {/* Edit Profile */}
          <button
            onClick={() => navigate('/profile/edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <span style={{ flex: 1, textAlign: 'left', color: '#1A1A1A', fontSize: '15px' }}>
              プロフィールを編集
            </span>
            <ChevronRight size={20} style={{ color: '#9CA3AF' }} />
          </button>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '16px',
              backgroundColor: 'rgba(255, 182, 193, 0.5)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <span style={{ color: '#FF3B30', fontWeight: 500, fontSize: '15px' }}>ログアウト</span>
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#9CA3AF', fontSize: '15px' }}>アカウントを削除</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="ログアウト"
      >
        <p className="text-[var(--muted-foreground)] mb-6">ログアウトしますか？</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowLogoutModal(false)}
          >
            キャンセル
          </Button>
          <Button className="flex-1" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="アカウントを削除"
      >
        <p className="text-[var(--muted-foreground)] mb-6">
          アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowDeleteModal(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
          >
            削除する
          </Button>
        </div>
      </Modal>
    </div>
  );
}
