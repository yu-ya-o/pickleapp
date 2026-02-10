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
