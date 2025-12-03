import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, Bell, User } from 'lucide-react';
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
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🥒</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PickleHub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200',
                      isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon size={22} />
                    <span className="font-medium">{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64 lg:ml-72">
        <Outlet />
      </main>

      {/* Bottom navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] safe-area-inset-bottom z-40 md:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full',
                  'transition-colors duration-200'
                )}
              >
                <Icon
                  size={24}
                  className={cn(
                    'mb-1',
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-gray-400'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-gray-400'
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
