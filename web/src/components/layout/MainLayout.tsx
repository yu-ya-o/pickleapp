import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, Trophy, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/events', icon: Calendar, label: 'イベント' },
  { to: '/teams', icon: Users, label: 'チーム' },
  { to: '/rankings', icon: Trophy, label: 'ランキング' },
  { to: '/notifications', icon: Bell, label: '通知' },
  { to: '/profile', icon: User, label: 'プロフィール' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar navigation - PC only */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-white border-r border-[var(--border)] fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-black italic text-[var(--foreground)]">PickleHub</h1>
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
          <p className="text-xs text-[var(--muted-foreground)] text-center">PickleHub v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64 lg:ml-72">
        <Outlet />
      </main>

      {/* Bottom navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] safe-area-inset-bottom z-40 md:hidden">
        <div className="flex items-center justify-around h-14">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center flex-1 h-full"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] mt-0.5',
                    isActive
                      ? 'text-[var(--primary)] font-medium'
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
