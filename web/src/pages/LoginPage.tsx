import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Sparkles, Zap, Users, Calendar } from 'lucide-react';

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

  const features = [
    { icon: Calendar, label: 'イベント管理', desc: '簡単に予約・参加' },
    { icon: Users, label: 'チーム機能', desc: '仲間と繋がる' },
    { icon: Zap, label: 'リアルタイム', desc: 'チャットで交流' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <span className="text-3xl font-bold">PickleHub</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            ピックルボールを
            <br />
            もっと楽しく
          </h1>

          <p className="text-xl text-white/80 mb-12">
            イベントの発見、チームの結成、
            <br />
            仲間との交流をひとつのアプリで。
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-white/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-12">
          <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
            <Sparkles className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">PickleHub</h1>
          <p className="text-[var(--muted-foreground)]">ピックルボールコミュニティ</p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              おかえりなさい
            </h2>
            <p className="text-[var(--muted-foreground)]">
              アカウントにログインして始めましょう
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-center mb-6 lg:hidden">ログイン</h3>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-10 h-10 border-3 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin" />
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
                  shape="pill"
                  locale="ja"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-[var(--muted-foreground)] text-sm mt-8">
            ログインすることで、
            <a href="#" className="text-[var(--primary)] hover:underline">利用規約</a>
            と
            <a href="#" className="text-[var(--primary)] hover:underline">プライバシーポリシー</a>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}
