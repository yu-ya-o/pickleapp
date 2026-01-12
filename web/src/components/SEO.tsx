import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
} from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  jsonLd?: object | object[];
  noindex?: boolean;
}

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
  jsonLd,
  noindex = false,
}: SEOProps) {
  const imageUrl = image || DEFAULT_OG_IMAGE;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;

  // Ensure image is absolute URL
  const ogImage = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// Pre-configured SEO components for common pages
export function EventsListSEO() {
  return (
    <SEO
      title="イベント一覧"
      description="ピックルボールのイベントを探そう。初心者から上級者まで、あなたにぴったりのイベントが見つかります。"
      url="/events"
    />
  );
}

export function TeamsListSEO() {
  return (
    <SEO
      title="チーム一覧"
      description="ピックルボールチームを探そう。全国のチームに参加して、仲間と一緒にプレイしましょう。"
      url="/teams"
    />
  );
}

export function RankingsSEO() {
  return (
    <SEO
      title="ランキング"
      description="ピックルボールプレイヤーのランキング。アクティブなプレイヤーをチェックしよう。"
      url="/rankings"
    />
  );
}

export function LoginSEO() {
  return (
    <SEO
      title="ログイン"
      description="PickleHubにログインして、ピックルボールコミュニティに参加しよう。"
      url="/login"
      noindex
    />
  );
}
