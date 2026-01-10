import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Share2,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button, Modal } from '@/components/ui';
import { getDisplayName, getSkillLevelLabel } from '@/lib/utils';
import type { Team } from '@/types';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await api.getMyTeams();
        setTeams(data);
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };
    loadTeams();
  }, []);

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
    { id: 1, date: '2025/12', tournament: '福岡オープン', result: '3位' },
    { id: 2, date: '2025/11', tournament: '初心者大会', result: '優勝' },
  ];

  // 仮のSNSデータ
  const snsLinks = [
    { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/example', bgColor: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' },
    { id: 'twitter', name: 'X (Twitter)', url: 'https://x.com/example', bgColor: '#000000' },
    { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com/@example', bgColor: '#000000' },
    { id: 'line', name: 'LINE', url: 'https://line.me/example', bgColor: '#06C755' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        <div style={{ width: '40px' }} />
        <h1 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#FFFFFF'
        }}>
          PLAYER CARD
        </h1>
        <button
          onClick={() => {/* TODO: Share */}}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Share2 size={18} style={{ color: '#FFFFFF' }} />
        </button>
      </header>

      {/* Trading Card */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(145deg, #2d2d44 0%, #1f1f35 100%)',
          borderRadius: '20px',
          padding: '4px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          {/* Card Inner with holographic border effect */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderRadius: '18px',
            padding: '3px'
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #252540 0%, #1a1a30 100%)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {/* Card Top - Image & Name */}
              <div style={{
                padding: '24px 20px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                {/* Profile Image with glow */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 0 30px rgba(102, 126, 234, 0.4)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#2a2a45'
                  }}>
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={getDisplayName(user)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px'
                      }}>
                        👤
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '12px',
                  letterSpacing: '0.5px'
                }}>
                  {getDisplayName(user)}
                </h2>

                {/* Bio */}
                {user.bio && (
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: '1.5',
                    maxWidth: '260px',
                    margin: '0 auto'
                  }}>
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stats Section */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  {/* DUPR Singles */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', letterSpacing: '1px' }}>
                      DUPR SINGLES
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#667eea' }}>
                      {user.duprSingles || '-'}
                    </p>
                  </div>
                  {/* DUPR Doubles */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', letterSpacing: '1px' }}>
                      DUPR DOUBLES
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#764ba2' }}>
                      {user.duprDoubles || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Grid - 2 columns, 3 rows */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 16px'
                }}>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '4px' }}>REGION</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{user.region || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '4px' }}>EXPERIENCE</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{user.pickleballExperience || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '4px' }}>LEVEL</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{user.skillLevel ? getSkillLevelLabel(user.skillLevel) : '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '4px' }}>GENDER</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{user.gender || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '4px' }}>AGE</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{user.ageGroup || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '4px' }}>PADDLE</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{user.myPaddle || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 所属チームセクション */}
      {teams.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '12px',
            letterSpacing: '1px'
          }}>
            TEAMS
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: team.iconImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  overflow: 'hidden'
                }}>
                  {team.iconImage ? (
                    <img src={team.iconImage} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '🏓'
                  )}
                </div>
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500 }}>
                  {team.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 戦績セクション */}
      <div style={{ padding: '20px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '12px',
          letterSpacing: '1px'
        }}>
          BATTLE RECORD
        </h3>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
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
                borderBottom: index !== battleRecords.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                  {record.tournament}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {record.date}
                </p>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: record.result === '優勝' ? '#F59E0B' : 'rgba(255,255,255,0.7)'
              }}>
                {record.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SNS Links Section */}
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '12px',
          letterSpacing: '1px'
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

      {/* Action Buttons */}
      <div style={{ padding: '0 20px 20px' }}>
        {/* Edit Profile */}
        <button
          onClick={() => navigate('/profile/edit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          <span style={{ flex: 1, textAlign: 'left', color: '#FFFFFF', fontSize: '15px' }}>
            プロフィールを編集
          </span>
          <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
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
            backgroundColor: 'rgba(255, 100, 100, 0.2)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          <span style={{ color: '#FF6B6B', fontWeight: 500, fontSize: '15px' }}>ログアウト</span>
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
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>アカウントを削除</span>
        </button>
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
