// SEO Configuration for PickleHub

export const SITE_URL = 'https://picklehub.jp';
export const SITE_NAME = 'PickleHub';
export const DEFAULT_TITLE = 'PickleHub - ピックルボールイベント・サークル募集';
export const DEFAULT_DESCRIPTION = '全国のピックルボールイベントを探して参加しよう！初心者歓迎のイベントから上級者向け大会まで。サークル募集・メンバー募集も。日本最大級のピックルボールコミュニティ。';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = '@picklehub';

// Skill level labels for SEO
export const SKILL_LEVEL_LABELS: Record<string, string> = {
  all: '全レベル',
  beginner: '初心者',
  intermediate: '中級者',
  advanced: '上級者',
};

// Region labels
export const REGION_LABELS: Record<string, string> = {
  hokkaido: '北海道',
  tohoku: '東北',
  kanto: '関東',
  chubu: '中部',
  kinki: '近畿',
  chugoku: '中国',
  shikoku: '四国',
  kyushu: '九州・沖縄',
};

// Generate page-specific metadata
export function generateEventMeta(event: {
  title: string;
  description: string;
  location: string;
  region: string;
  skillLevel: string;
  startTime: string;
}) {
  const skillLabel = SKILL_LEVEL_LABELS[event.skillLevel] || event.skillLevel;
  const date = new Date(event.startTime).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title: `${event.title} | ${SITE_NAME}`,
    description: `${date}に${event.location}で開催されるピックルボールイベント。${skillLabel}対象。${event.description.slice(0, 100)}`,
  };
}

export function generateTeamMeta(team: {
  name: string;
  description?: string;
  region?: string;
  memberCount: number;
}) {
  const regionLabel = team.region ? REGION_LABELS[team.region] || team.region : '';

  return {
    title: `${team.name} | ${SITE_NAME}`,
    description: `${team.name}は${regionLabel ? regionLabel + 'の' : ''}ピックルボールサークルです。メンバー${team.memberCount}人。${team.description?.slice(0, 80) || 'PickleHubでサークルに参加しよう！'}`,
  };
}

export function generateUserMeta(user: {
  name: string;
  nickname?: string | null;
  bio?: string | null;
  skillLevel?: string | null;
  region?: string | null;
}) {
  const displayName = user.nickname || user.name;
  const skillLabel = user.skillLevel ? SKILL_LEVEL_LABELS[user.skillLevel] || user.skillLevel : '';
  const regionLabel = user.region ? REGION_LABELS[user.region] || user.region : '';

  return {
    title: `${displayName} | ${SITE_NAME}`,
    description: `${displayName}さんのピックルボールプロフィール。${regionLabel ? regionLabel + '在住。' : ''}${skillLabel ? 'レベル: ' + skillLabel + '。' : ''}${user.bio?.slice(0, 80) || ''}`,
  };
}

// JSON-LD Structured Data generators
export function generateEventJsonLd(event: {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  availableSpots: number;
  price?: number;
  creator: { name: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    description: event.description,
    startDate: event.startTime,
    endDate: event.endTime,
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.address || event.location,
    },
    organizer: {
      '@type': 'Person',
      name: event.creator.name,
    },
    maximumAttendeeCapacity: event.maxParticipants,
    remainingAttendeeCapacity: event.availableSpots,
    isAccessibleForFree: !event.price || event.price === 0,
    ...(event.price && event.price > 0 && {
      offers: {
        '@type': 'Offer',
        price: event.price,
        priceCurrency: 'JPY',
        availability: event.availableSpots > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      },
    }),
    sport: 'Pickleball',
    url: `${SITE_URL}/events/${event.id}`,
  };
}

export function generateTeamJsonLd(team: {
  id: string;
  name: string;
  description?: string;
  iconImage?: string;
  memberCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: team.name,
    description: team.description || `${team.name} - ピックルボールサークル`,
    sport: 'Pickleball',
    ...(team.iconImage && { logo: team.iconImage }),
    numberOfEmployees: team.memberCount,
    url: `${SITE_URL}/teams/${team.id}`,
  };
}

export function generateUserJsonLd(user: {
  id: string;
  name: string;
  nickname?: string | null;
  bio?: string | null;
  profileImage?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.nickname || user.name,
    ...(user.bio && { description: user.bio }),
    ...(user.profileImage && { image: user.profileImage }),
    url: `${SITE_URL}/p/${user.id}`,
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      'https://twitter.com/picklehub',
    ],
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/events?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// BreadcrumbList JSON-LD generators
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

// Pre-defined breadcrumb generators for common pages
export function generateEventBreadcrumb(eventTitle: string, eventId: string) {
  return generateBreadcrumbJsonLd([
    { name: 'ホーム', url: '/' },
    { name: 'イベント一覧', url: '/events' },
    { name: eventTitle, url: `/events/${eventId}` },
  ]);
}

export function generateTeamBreadcrumb(teamName: string, teamId: string) {
  return generateBreadcrumbJsonLd([
    { name: 'ホーム', url: '/' },
    { name: 'サークル一覧', url: '/teams' },
    { name: teamName, url: `/teams/${teamId}` },
  ]);
}

export function generateUserBreadcrumb(userName: string, userId: string) {
  return generateBreadcrumbJsonLd([
    { name: 'ホーム', url: '/' },
    { name: userName, url: `/p/${userId}` },
  ]);
}

export function generateTeamEventBreadcrumb(
  teamName: string,
  teamId: string,
  eventTitle: string,
  eventId: string
) {
  return generateBreadcrumbJsonLd([
    { name: 'ホーム', url: '/' },
    { name: 'サークル一覧', url: '/teams' },
    { name: teamName, url: `/teams/${teamId}` },
    { name: eventTitle, url: `/teams/${teamId}/events/${eventId}` },
  ]);
}
