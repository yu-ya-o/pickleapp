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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      {/* Logo and Title */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-[var(--primary)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-4xl">🥒</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PickleHub</h1>
        <p className="text-gray-500">ピックルボールコミュニティ</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--border)]">
          <h2 className="text-xl font-semibold text-center mb-6">ログイン</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full w-8 h-8 border-2 border-gray-200 border-t-[var(--primary)]" />
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                locale="ja"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
