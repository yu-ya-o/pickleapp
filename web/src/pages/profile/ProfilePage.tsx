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
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-black italic text-center" style={{ paddingTop: '12px', paddingBottom: '12px' }}>PickleHub</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-24">
        {/* Profile Header */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={user.profileImage}
              alt={getDisplayName(user)}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {getDisplayName(user)}
              </h2>
              {user.bio && (
                <p className="text-sm text-[var(--muted-foreground)] mt-2 whitespace-pre-wrap break-words">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-2 bg-[#F5F5F5]" />

        {/* Profile Info Section */}
        <section className="bg-white">
          <h3 className="px-4 pt-4 pb-2 text-base font-semibold text-[var(--foreground)]">
            プロフィール情報
          </h3>
          <div className="mx-4 mb-4 bg-[#F8F8F8] rounded-xl overflow-hidden">
            {profileItems.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center px-4 py-3 ${
                  index !== profileItems.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <item.icon size={20} className="text-[var(--primary)] flex-shrink-0" />
                <span className="text-sm text-[var(--muted-foreground)] ml-3" style={{ width: '120px', flexShrink: 0 }}>
                  {item.label}
                </span>
                <span className="text-sm text-[var(--foreground)] font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-[#F5F5F5]" />

        {/* Action Buttons */}
        <div className="bg-white px-4 py-4 space-y-3">
          {/* My Events */}
          <button
            onClick={() => navigate('/my-events')}
            className="flex items-center w-full px-4 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Calendar size={20} className="text-[var(--muted-foreground)]" />
            <span className="flex-1 text-left text-[var(--foreground)] ml-3">マイイベント</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          {/* Edit Profile */}
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center w-full px-4 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit size={20} className="text-[var(--muted-foreground)]" />
            <span className="flex-1 text-left text-[var(--foreground)] ml-3">プロフィールを編集</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          {/* Contact */}
          <a
            href="mailto:support@picklehub.app"
            className="flex items-center w-full px-4 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Mail size={20} className="text-[var(--muted-foreground)]" />
            <span className="flex-1 text-left text-[var(--foreground)] ml-3">お問い合わせ</span>
            <ExternalLink size={20} className="text-gray-400" />
          </a>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center w-full px-4 py-4 rounded-xl transition-colors"
            style={{ backgroundColor: 'rgba(255, 182, 193, 0.4)', color: '#FF3B30' }}
          >
            <span className="font-medium">ログアウト</span>
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center w-full px-4 py-4 border border-gray-200 rounded-xl transition-colors hover:bg-gray-50"
            style={{ color: '#9CA3AF' }}
          >
            <span>アカウントを削除</span>
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
