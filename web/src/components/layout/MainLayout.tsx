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
    <div className="flex flex-col min-h-screen bg-[var(--muted)]">
      {/* Main content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation - iOS Tab Bar style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] safe-area-inset-bottom z-40">
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
