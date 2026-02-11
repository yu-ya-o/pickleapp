import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import type { HelmetServerState } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import type { User } from '@/types';

// Pages
import { HomePage } from '@/pages/HomePage';
import { EventsListPage } from '@/pages/events/EventsListPage';
import { TeamsListPage } from '@/pages/teams/TeamsListPage';
import { RankingsPage } from '@/pages/rankings/RankingsPage';
import { TournamentsListPage } from '@/pages/tournaments/TournamentsListPage';

// Mock auth context for SSR - unauthenticated state
const mockAuthValue = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  signInWithGoogle: async (_idToken: string) => ({ isNewUser: false }),
  signOut: () => {},
  updateUser: (_user: User) => {},
  refreshUser: async () => {},
};

interface RenderResult {
  html: string;
  helmet: HelmetServerState | undefined;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AuthContext.Provider value={mockAuthValue}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/teams" element={<TeamsListPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/tournaments" element={<TournamentsListPage />} />
          </Routes>
        </AuthContext.Provider>
      </StaticRouter>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet };
}
