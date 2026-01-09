import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Edit,
  Mail,
  LogOut,
  Trash2,
  User,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
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

  const profileItems = [
    { icon: User, label: 'ニックネーム', value: user.nickname || '-' },
    { icon: MapPin, label: '地域', value: user.region || '-' },
    { icon: Clock, label: 'ピックルボール歴', value: user.pickleballExperience || '-' },
    { icon: Star, label: 'レベル', value: user.skillLevel ? getSkillLevelLabel(user.skillLevel) : '-' },
    { icon: TrendingUp, label: 'DUPR ダブルス', value: user.duprDoubles || '-' },
    { icon: TrendingUp, label: 'DUPR シングルス', value: user.duprSingles || '-' },
    { icon: Edit, label: '使用パドル', value: user.myPaddle || '-' },
    { icon: Users, label: '性別', value: user.gender || '-' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-black italic text-center pt-6 pb-12">PickleHub</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Profile Header */}
        <div className="py-8">
          <div className="flex items-start gap-5">
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
                <p className="text-sm text-[var(--muted-foreground)] mt-3 whitespace-pre-wrap break-words">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <section>
          <h3 className="px-1 py-2 text-sm font-medium text-[var(--muted-foreground)]">
            プロフィール情報
          </h3>
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            {profileItems.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index !== profileItems.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                <item.icon size={20} className="text-[var(--primary)] flex-shrink-0" />
                <span className="text-sm text-[var(--muted-foreground)] w-32 flex-shrink-0">
                  {item.label}
                </span>
                <span className="text-sm text-[var(--foreground)] font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {/* My Events */}
          <button
            onClick={() => navigate('/events')}
            className="flex items-center w-full px-5 py-4 bg-white border border-[var(--border)] rounded-2xl hover:bg-[var(--muted)] transition-colors"
          >
            <Calendar size={20} className="text-[var(--muted-foreground)] mr-4" />
            <span className="flex-1 text-left text-[var(--foreground)]">マイイベント</span>
            <ChevronRight size={20} className="text-[var(--muted-foreground)]" />
          </button>

          {/* Edit Profile */}
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center w-full px-5 py-4 bg-white border border-[var(--border)] rounded-2xl hover:bg-[var(--muted)] transition-colors"
          >
            <Edit size={20} className="text-[var(--muted-foreground)] mr-4" />
            <span className="flex-1 text-left text-[var(--foreground)]">プロフィールを編集</span>
            <ChevronRight size={20} className="text-[var(--muted-foreground)]" />
          </button>

          {/* Contact */}
          <a
            href="mailto:support@picklehub.app"
            className="flex items-center w-full px-5 py-4 bg-white border border-[var(--border)] rounded-2xl hover:bg-[var(--muted)] transition-colors"
          >
            <Mail size={20} className="text-[var(--muted-foreground)] mr-4" />
            <span className="flex-1 text-left text-[var(--foreground)]">お問い合わせ</span>
            <ExternalLink size={20} className="text-[var(--muted-foreground)]" />
          </a>
        </div>

        {/* Logout & Delete */}
        <div className="mt-10 space-y-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center w-full px-5 py-4 text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-2xl transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>ログアウト</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center w-full px-5 py-4 text-[var(--destructive)] hover:bg-red-50 rounded-2xl transition-colors"
          >
            <Trash2 size={20} className="mr-3" />
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
