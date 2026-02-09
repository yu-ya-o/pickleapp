import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useDrawer } from '@/contexts/DrawerContext';
import { LoginSEO } from '@/components/SEO';
import { isInAppBrowser, getInAppBrowserName } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const { openDrawer } = useDrawer();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inAppBrowser = useMemo(() => isInAppBrowser(), []);
  const inAppBrowserName = useMemo(() => getInAppBrowserName(), []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google認証に失敗しました');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { isNewUser } = await signInWithGoogle(credentialResponse.credential);
      navigate(isNewUser ? '/profile/edit' : '/profile');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google認証に失敗しました');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <LoginSEO />
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={openDrawer}
            className="md:hidden"
            style={{
              background: '#F0F0F0',
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
            <Menu size={20} style={{ color: '#1a1a2e' }} />
          </button>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#1a1a2e'
          }}>
            PickleHub
          </h1>
          <div style={{ width: '36px' }} className="md:hidden" />
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          paddingTop: '80px',
        }}
      >
        {/* App Name - Italic style */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#1a1a2e',
            marginBottom: '16px',
          }}
        >
          PickleHub
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#666666',
            marginBottom: '80px',
          }}
        >
          ログインして、ピックルボールイベントに参加しよう！
        </p>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: '24px',
              padding: '12px 24px',
              backgroundColor: '#FEE2E2',
              borderRadius: '12px',
              color: '#DC2626',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <div style={{ width: '100%', maxWidth: '320px' }}>
          {inAppBrowser ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E5E5',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#666666',
                  marginBottom: '16px',
                  lineHeight: '1.6',
                }}
              >
                {inAppBrowserName
                  ? `${inAppBrowserName}のアプリ内ブラウザではGoogleログインが利用できません。`
                  : 'アプリ内ブラウザではGoogleログインが利用できません。'}
                <br />
                外部ブラウザで開いてください。
              </p>
              <a
                href={(() => {
                  const url = window.location.href;
                  // LINE supports openExternalBrowser param
                  if (inAppBrowserName === 'LINE') {
                    const sep = url.includes('?') ? '&' : '?';
                    return `${url}${sep}openExternalBrowser=1`;
                  }
                  return url;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: '#1a1a2e',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px',
                  textDecoration: 'none',
                  textAlign: 'center' as const,
                  boxSizing: 'border-box' as const,
                }}
              >
                外部ブラウザで開く
              </a>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    // Fallback for browsers that don't support clipboard API
                    const input = document.createElement('input');
                    input.value = window.location.href;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: copied ? '#E8F5E9' : '#F0F0F0',
                  color: copied ? '#2E7D32' : '#333333',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
              >
                {copied ? 'コピーしました！' : 'URLをコピー'}
              </button>
              {inAppBrowserName === 'LINE' ? (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', lineHeight: '1.5' }}>
                  ボタンが動かない場合は、右下の「…」メニューから
                  <br />「Safari で開く」を選んでください。
                </p>
              ) : (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', lineHeight: '1.5' }}>
                  URLをコピーして、SafariやChromeなどの
                  <br />ブラウザに貼り付けて開いてください。
                </p>
              )}
            </div>
          ) : isLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #E5E7EB',
                  borderTopColor: '#3B82F6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                locale="ja"
                width="320"
              />
            </div>
          )}
        </div>

        {/* Spin animation style */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
