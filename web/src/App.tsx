import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingPage } from '@/components/ui';
import { config } from '@/lib/config';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { EventsListPage } from '@/pages/events/EventsListPage';
import { EventDetailPage } from '@/pages/events/EventDetailPage';
import { CreateEventPage } from '@/pages/events/CreateEventPage';
import { TeamsListPage } from '@/pages/teams/TeamsListPage';
import { TeamDetailPage } from '@/pages/teams/TeamDetailPage';
import { TeamEventDetailPage } from '@/pages/teams/TeamEventDetailPage';
import { TeamChatPage } from '@/pages/teams/TeamChatPage';
import { CreateTeamEventPage } from '@/pages/teams/CreateTeamEventPage';
import { TeamMembersPage } from '@/pages/teams/TeamMembersPage';
import { TeamEventsListPage } from '@/pages/teams/TeamEventsListPage';
import { TeamJoinRequestsPage } from '@/pages/teams/TeamJoinRequestsPage';
import { TeamEditPage } from '@/pages/teams/TeamEditPage';
import { RankingsPage } from '@/pages/rankings/RankingsPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
}

// Wrapper that shows loading while auth is initializing
function OptionalAuthRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Public viewable routes (no auth required) */}
      <Route path="/events/:id" element={<OptionalAuthRoute><EventDetailPage /></OptionalAuthRoute>} />
      <Route path="/teams/:id" element={<OptionalAuthRoute><TeamDetailPage /></OptionalAuthRoute>} />
      <Route path="/teams/:teamId/events/:eventId" element={<OptionalAuthRoute><TeamEventDetailPage /></OptionalAuthRoute>} />

      {/* Protected fullscreen routes (auth required) */}
      <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:eventId/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

      <Route path="/teams/:teamId/members" element={<ProtectedRoute><TeamMembersPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/events" element={<ProtectedRoute><TeamEventsListPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/requests" element={<ProtectedRoute><TeamJoinRequestsPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/edit" element={<ProtectedRoute><TeamEditPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/chat" element={<ProtectedRoute><TeamChatPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/events/create" element={<ProtectedRoute><CreateTeamEventPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/events/:eventId/edit" element={<ProtectedRoute><CreateTeamEventPage /></ProtectedRoute>} />

      {/* Public list routes with MainLayout */}
      <Route
        element={
          <OptionalAuthRoute>
            <MainLayout />
          </OptionalAuthRoute>
        }
      >
        {/* Public pages */}
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/teams" element={<TeamsListPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
      </Route>

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Redirect root to events */}
      <Route path="/" element={<Navigate to="/events" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
