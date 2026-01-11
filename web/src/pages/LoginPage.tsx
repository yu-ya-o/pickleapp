import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

// Pickleball player icon SVG
function PickleballPlayerIcon({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="50" cy="18" r="10" fill="#22C55E" />
      {/* Body */}
      <path
        d="M50 28 L50 55"
        stroke="#22C55E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Left arm (holding paddle) */}
      <path
        d="M50 38 L70 28"
        stroke="#22C55E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Paddle */}
      <rect
        x="68"
        y="12"
        width="8"
        height="20"
        rx="4"
        fill="#22C55E"
      />
      {/* Right arm */}
      <path
        d="M50 38 L30 48"
        stroke="#22C55E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Left leg */}
      <path
        d="M50 55 L35 80"
        stroke="#22C55E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Right leg */}
      <path
        d="M50 55 L65 80"
        stroke="#22C55E"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google認証に失敗しました');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle(credentialResponse.credential);
      navigate('/events');
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: '24px',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '24px' }}>
        <PickleballPlayerIcon size={120} />
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#1a1a2e',
          marginBottom: '12px',
        }}
      >
        PickleHub
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '16px',
          color: '#888888',
          marginBottom: '80px',
        }}
      >
        ピックルボールをもっと楽しく
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
        {isLoading ? (
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
              useOneTap
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
  );
}
