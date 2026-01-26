import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Instagram, ExternalLink } from 'lucide-react';
import { api } from '@/services/api';
import type { UserProfile } from '@/services/api';
import { Loading } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SEO } from '@/components/SEO';
import { generateUserMeta, generateUserJsonLd, generateUserBreadcrumb } from '@/lib/seo';
import { getDisplayName, getSkillLevelLabel } from '@/lib/utils';
import type { Team } from '@/types';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    } else {
      setIsLoading(false);
      setError('ユーザーIDが指定されていません');
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user profile first
      const userData = await api.getUserProfile(userId!);
      setUser(userData);

      // Fetch teams separately (don't block on failure)
      try {
        const teamsData = await api.getUserTeams(userId!);
        setTeams(teamsData);
      } catch (teamsError) {
        console.error('Failed to load user teams:', teamsError);
        // Teams are optional, don't show error for this
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (error instanceof Error && error.message.includes('404')) {
        setError('ユーザーが見つかりません');
      } else {
        setError(error instanceof Error ? error.message : 'プロフィールの読み込みに失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{error || 'ユーザーが見つかりません'}</p>
      </div>
    );
  }

  // SNS Links
  const snsLinks = [
    user.instagramUrl && { id: 'instagram', name: 'Instagram', url: user.instagramUrl, bgColor: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' },
    user.twitterUrl && { id: 'twitter', name: 'X (Twitter)', url: user.twitterUrl, bgColor: '#000000' },
    user.tiktokUrl && { id: 'tiktok', name: 'TikTok', url: user.tiktokUrl, bgColor: '#000000' },
    user.lineUrl && { id: 'line', name: 'LINE', url: user.lineUrl, bgColor: '#06C755' },
  ].filter(Boolean) as { id: string; name: string; url: string; bgColor: string }[];

  const seoMeta = generateUserMeta(user);
  const seoJsonLd = generateUserJsonLd({ ...user, id: userId! });
  const seoBreadcrumb = generateUserBreadcrumb(getDisplayName(user), userId!);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7',
      paddingBottom: '24px',
      overflowX: 'hidden'
    }}>
      <SEO
        title={seoMeta.title}
        description={seoMeta.description}
        keywords="ピックルボール, プレイヤー, pickleball, プロフィール"
        image={user.profileImage}
        url={`/p/${userId}`}
        type="profile"
        jsonLd={[seoJsonLd, seoBreadcrumb]}
      />
      <PageHeader />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 16px', background: '#F5F5F7' }}>
        <Breadcrumb
          items={[
            { label: getDisplayName(user) }
          ]}
        />
      </div>

      {/* Trading Card */}
      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {/* Card Inner with subtle border effect */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(163, 230, 53, 0.1) 0%, rgba(101, 163, 13, 0.1) 100%)',
            borderRadius: '18px',
            padding: '3px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {/* Card Top - Image & Name */}
              <div style={{
                padding: '24px 20px',
                textAlign: 'center',
                borderBottom: '1px solid #E5E5E5'
              }}>
                {/* Profile Image with glow */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
                  boxShadow: '0 0 30px rgba(101, 163, 13, 0.3)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#F5F5F7'
                  }}>
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={getDisplayName(user)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
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
                  color: '#1a1a2e',
                  marginBottom: '12px',
                  letterSpacing: '0.5px'
                }}>
                  {getDisplayName(user)}
                </h2>

                {/* Bio */}
                {user.bio && (
                  <p style={{
                    fontSize: '13px',
                    color: '#888888',
                    lineHeight: '1.5',
                    maxWidth: '260px',
                    margin: '0 auto'
                  }}>
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stats Section */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E5E5' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  {/* DUPR Singles */}
                  <div style={{
                    background: '#F5F5F7',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '10px', color: '#888888', marginBottom: '4px', letterSpacing: '1px' }}>
                      DUPR SINGLES
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#65A30D' }}>
                      {user.duprSingles || '-'}
                    </p>
                  </div>
                  {/* DUPR Doubles */}
                  <div style={{
                    background: '#F5F5F7',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '10px', color: '#888888', marginBottom: '4px', letterSpacing: '1px' }}>
                      DUPR DOUBLES
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#4d7c0f' }}>
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
                    <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px', marginBottom: '4px' }}>REGION</p>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{user.region || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px', marginBottom: '4px' }}>EXPERIENCE</p>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{user.pickleballExperience || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px', marginBottom: '4px' }}>LEVEL</p>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{user.skillLevel ? getSkillLevelLabel(user.skillLevel) : '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px', marginBottom: '4px' }}>GENDER</p>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{user.gender || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px', marginBottom: '4px' }}>AGE</p>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{user.ageGroup || '-'}</p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px', marginBottom: '4px' }}>PADDLE</p>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{user.myPaddle || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 所属チームセクション */}
      {teams.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#888888',
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
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
                    <img src={team.iconImage} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    '🏓'
                  )}
                </div>
                <span style={{ fontSize: '13px', color: '#1a1a2e', fontWeight: 500 }}>
                  {team.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SNS Links Section */}
      {snsLinks.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#888888',
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
      )}
    </div>
  );
}
