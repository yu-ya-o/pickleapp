import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, CalendarCheck, Users, Medal, Trophy, User, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
// import { WebAdBanner } from './WebAdBanner';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  // Build nav items based on auth state
  const navItems = isAuthenticated
    ? [
        { to: '/', icon: Home, label: 'ホーム', exact: true },
        { to: '/events', icon: Calendar, label: 'イベント' },
        { to: '/my-events', icon: CalendarCheck, label: 'マイイベント' },
        { to: '/teams', icon: Users, label: 'サークル' },
        { to: '/tournaments', icon: Medal, label: '大会情報' },
        { to: '/rankings', icon: Trophy, label: 'ランキング' },
        { to: '/profile', icon: User, label: 'プロフィール' },
      ]
    : [
        { to: '/', icon: Home, label: 'ホーム', exact: true },
        { to: '/events', icon: Calendar, label: 'イベント' },
        { to: '/teams', icon: Users, label: 'サークル' },
        { to: '/tournaments', icon: Medal, label: '大会情報' },
        { to: '/rankings', icon: Trophy, label: 'ランキング' },
        { to: '/login', icon: LogIn, label: 'ログイン' },
      ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Determine which tab should be active
  const isTabActive = (to: string, exact?: boolean) => {
    const path = location.pathname;

    // Exact match for home
    if (exact) {
      return path === to;
    }

    // Team events (e.g., /teams/123/events/456) should highlight イベント tab
    if (to === '/events' && path.includes('/teams/') && path.includes('/events/')) {
      return true;
    }

    // Prevent /teams/123/events/456 from highlighting サークル tab
    if (to === '/teams' && path.includes('/events/')) {
      return false;
    }

    // Default: check if path starts with the nav item path
    return path.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      {/* Sidebar navigation - PC only */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-white border-r border-[var(--border)] fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-black italic text-[var(--foreground)]">PickleHub</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, exact }) => {
              const isActive = isTabActive(to, exact);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-full w-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200 mb-2"
            >
              <LogOut size={20} strokeWidth={2} />
              <span>ログアウト</span>
            </button>
          )}
          <div className="flex items-center justify-center gap-3 mb-2">
            <a
              href="https://twitter.com/picklehub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Twitter/X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/picklehub_jp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] text-center">PickleHub v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 lg:ml-72 overflow-x-hidden pb-16">
        <Outlet />
      </main>

      {/* 下部固定広告バナー（一時的にコメントアウト）
      <WebAdBanner />
      */}
    </div>
  );
}
