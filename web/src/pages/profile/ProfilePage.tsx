import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Edit,
  Calendar,
  Users,
  LogOut,
  Trash2,
  Instagram,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button, Card, CardContent, Avatar, Modal } from '@/components/ui';
import { getDisplayName, getSkillLevelEmoji, getSkillLevelLabel } from '@/lib/utils';

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

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">プロフィール</h1>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/profile/edit')}
            >
              <Edit size={16} className="mr-1" />
              編集
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={user.profileImage}
                alt={getDisplayName(user)}
                size="xl"
                className="mb-4"
              />
              <h2 className="text-xl font-bold">{getDisplayName(user)}</h2>
              {user.region && (
                <div className="flex items-center gap-1 text-gray-500 mt-1">
                  <MapPin size={14} />
                  <span>{user.region}</span>
                </div>
              )}
              {user.bio && (
                <p className="text-gray-600 mt-3 whitespace-pre-wrap">
                  {user.bio}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Card */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">スキル情報</h3>
            <div className="space-y-3">
              {user.skillLevel && (
                <div className="flex justify-between">
                  <span className="text-gray-500">スキルレベル</span>
                  <span>
                    {getSkillLevelEmoji(user.skillLevel)}{' '}
                    {getSkillLevelLabel(user.skillLevel)}
                  </span>
                </div>
              )}
              {user.pickleballExperience && (
                <div className="flex justify-between">
                  <span className="text-gray-500">経験</span>
                  <span>{user.pickleballExperience}</span>
                </div>
              )}
              {user.duprDoubles && (
                <div className="flex justify-between">
                  <span className="text-gray-500">DUPR (ダブルス)</span>
                  <span>{user.duprDoubles}</span>
                </div>
              )}
              {user.duprSingles && (
                <div className="flex justify-between">
                  <span className="text-gray-500">DUPR (シングルス)</span>
                  <span>{user.duprSingles}</span>
                </div>
              )}
              {user.myPaddle && (
                <div className="flex justify-between">
                  <span className="text-gray-500">パドル</span>
                  <span>{user.myPaddle}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SNS Links */}
        {(user.instagramUrl || user.twitterUrl || user.tiktokUrl) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">SNS</h3>
              <div className="flex gap-3">
                {user.instagramUrl && (
                  <a
                    href={user.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Instagram size={20} />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card>
          <CardContent className="p-0">
            <Link
              to="/profile/events"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <Calendar size={20} className="text-gray-400" />
              <span>参加イベント</span>
            </Link>
            <div className="border-t border-[var(--border)]" />
            <Link
              to="/profile/teams"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <Users size={20} className="text-gray-400" />
              <span>参加チーム</span>
            </Link>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 p-4 w-full hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut size={20} className="text-gray-400" />
              <span>ログアウト</span>
            </button>
            <div className="border-t border-[var(--border)]" />
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-3 p-4 w-full hover:bg-gray-50 transition-colors text-left text-red-500"
            >
              <Trash2 size={20} />
              <span>アカウントを削除</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="ログアウト"
      >
        <p className="text-gray-600 mb-6">ログアウトしますか？</p>
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
        <p className="text-gray-600 mb-6">
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
