import { useState, createContext, useContext } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy, User, X, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Context for drawer state
const DrawerContext = createContext<{
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}>({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Build nav items based on auth state
  const navItems = isAuthenticated
    ? [
        { to: '/events', icon: Calendar, label: 'イベント' },
        { to: '/teams', icon: Users, label: 'チーム' },
        { to: '/rankings', icon: Trophy, label: 'ランキング' },
        { to: '/profile', icon: User, label: 'プロフィール' },
      ]
    : [
        { to: '/events', icon: Calendar, label: 'イベント' },
        { to: '/teams', icon: Users, label: 'チーム' },
        { to: '/rankings', icon: Trophy, label: 'ランキング' },
        { to: '/login', icon: LogIn, label: 'ログイン' },
      ];

  const handleLogout = async () => {
    await signOut();
    closeDrawer();
    navigate('/login');
  };

  // Determine which tab should be active
  const isTabActive = (to: string) => {
    const path = location.pathname;

    // Team events (e.g., /teams/123/events/456) should highlight イベント tab
    if (to === '/events' && path.includes('/teams/') && path.includes('/events/')) {
      return true;
    }

    // Prevent /teams/123/events/456 from highlighting チーム tab
    if (to === '/teams' && path.includes('/events/')) {
      return false;
    }

    // Default: check if path starts with the nav item path
    return path.startsWith(to);
  };

  return (
    <DrawerContext.Provider value={{ isOpen: isDrawerOpen, openDrawer, closeDrawer }}>
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
              {navItems.map(({ to, icon: Icon, label }) => {
                const isActive = isTabActive(to);
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
        <main className="flex-1 md:ml-64 lg:ml-72 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={closeDrawer}
          />
        )}

        {/* Mobile Drawer Menu */}
        <div
          className={cn(
            'fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-out md:hidden',
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ boxShadow: isDrawerOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none' }}
        >
          {/* Drawer Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E5E5'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#1a1a2e'
            }}>
              PickleHub
            </h1>
            <button
              onClick={closeDrawer}
              style={{
                background: '#F0F0F0',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} style={{ color: '#1a1a2e' }} />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav style={{ padding: '16px' }}>
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = isTabActive(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeDrawer}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    marginBottom: '4px',
                    background: isActive ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'transparent',
                    color: isActive ? '#667eea' : '#1a1a2e',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '15px',
                    transition: 'background 0.2s'
                  }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Drawer Footer */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid #E5E5E5'
          }}>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: '#DC2626',
                  fontWeight: 400,
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                <LogOut size={22} strokeWidth={2} />
                <span>ログアウト</span>
              </button>
            )}
            <p style={{ fontSize: '12px', color: '#888888', textAlign: 'center' }}>
              PickleHub v1.0
            </p>
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  );
}
