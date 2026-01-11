import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

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
