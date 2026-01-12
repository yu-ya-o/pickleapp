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
import { ProfileEditPage } from '@/pages/profile/ProfileEditPage';
import { UserProfilePage } from '@/pages/users/UserProfilePage';

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
      {/* All routes with MainLayout - sidebar on PC, drawer on mobile */}
      <Route
        element={
          <OptionalAuthRoute>
            <MainLayout />
          </OptionalAuthRoute>
        }
      >
        {/* Public pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/teams" element={<TeamsListPage />} />
        <Route path="/teams/:id" element={<TeamDetailPage />} />
        <Route path="/teams/:teamId/events/:eventId" element={<TeamEventDetailPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/rankings" element={<RankingsPage />} />

        {/* Protected routes - require auth */}
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

        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
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
