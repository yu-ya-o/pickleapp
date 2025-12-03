import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, Bell, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/events', icon: Calendar, label: 'イベント' },
  { to: '/teams', icon: Users, label: 'チーム' },
  { to: '/notifications', icon: Bell, label: '通知' },
  { to: '/profile', icon: User, label: 'プロフィール' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[var(--muted)]">
      {/* Sidebar navigation - PC only */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-white border-r border-[var(--border)] fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">PickleHub</span>
              <p className="text-xs text-[var(--muted-foreground)]">ピックルボール</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'gradient-bg text-white shadow-md shadow-purple-500/20'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-light)] to-pink-50">
            <p className="text-sm font-medium text-[var(--primary)]">PickleHub v1.0</p>
            <p className="text-xs text-[var(--muted-foreground)]">Made with love</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64 lg:ml-72">
        <Outlet />
      </main>

      {/* Bottom navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-[var(--border)] safe-area-inset-bottom z-40 md:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full',
                  'transition-all duration-200'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-xl transition-all duration-200',
                    isActive && 'gradient-bg shadow-sm'
                  )}
                >
                  <Icon
                    size={22}
                    className={cn(
                      isActive ? 'text-white' : 'text-[var(--muted-foreground)]'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-medium mt-1',
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--muted-foreground)]'
                  )}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
