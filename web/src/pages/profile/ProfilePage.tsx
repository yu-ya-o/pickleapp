import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Edit,
  Mail,
  User,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
  ExternalLink,
  Hash,
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

  const profileItems = [
    { icon: User, label: 'ニックネーム', value: user.nickname || '-' },
    { icon: MapPin, label: '地域', value: user.region || '-' },
    { icon: Clock, label: 'ピックルボール歴', value: user.pickleballExperience || '-' },
    { icon: Star, label: 'レベル', value: user.skillLevel ? getSkillLevelLabel(user.skillLevel) : '-' },
    { icon: TrendingUp, label: 'DUPR ダブルス', value: user.duprDoubles || '-' },
    { icon: TrendingUp, label: 'DUPR シングルス', value: user.duprSingles || '-' },
    { icon: Edit, label: '使用パドル', value: user.myPaddle || '-' },
    { icon: Users, label: '性別', value: user.gender || '-' },
    { icon: Hash, label: '年代', value: user.ageGroup || '-' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '12px 16px'
        }}>
          PickleHub
        </h1>
      </header>

      {/* Content */}
      <div style={{ paddingBottom: '100px' }}>
        {/* Profile Header */}
        <div style={{ padding: '24px 16px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Avatar
              src={user.profileImage}
              alt={getDisplayName(user)}
              size="xl"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>
                {getDisplayName(user)}
              </h2>
              {user.bio && (
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  marginTop: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {user.bio}
                </p>
              )}
            </div>
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
            borderRadius: '16px',
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

        {/* Action Buttons */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px' }}>
          {/* My Events */}
          <button
            onClick={() => navigate('/my-events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <Calendar size={20} style={{ color: '#6B7280' }} />
            <span style={{ flex: 1, textAlign: 'left', color: '#1A1A1A', marginLeft: '12px', fontSize: '15px' }}>
              マイイベント
            </span>
            <ChevronRight size={20} style={{ color: '#9CA3AF' }} />
          </button>

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
              borderRadius: '16px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <Edit size={20} style={{ color: '#6B7280' }} />
            <span style={{ flex: 1, textAlign: 'left', color: '#1A1A1A', marginLeft: '12px', fontSize: '15px' }}>
              プロフィールを編集
            </span>
            <ChevronRight size={20} style={{ color: '#9CA3AF' }} />
          </button>

          {/* Contact */}
          <a
            href="mailto:support@picklehub.app"
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              cursor: 'pointer',
              marginBottom: '12px',
              textDecoration: 'none'
            }}
          >
            <Mail size={20} style={{ color: '#6B7280' }} />
            <span style={{ flex: 1, textAlign: 'left', color: '#1A1A1A', marginLeft: '12px', fontSize: '15px' }}>
              お問い合わせ
            </span>
            <ExternalLink size={20} style={{ color: '#9CA3AF' }} />
          </a>

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
              borderRadius: '16px',
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
              borderRadius: '16px',
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
