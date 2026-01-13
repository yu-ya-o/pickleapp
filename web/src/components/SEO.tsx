import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
} from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string | null;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  jsonLd?: object | object[];
  noindex?: boolean;
}

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords,
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
      {keywords && <meta name="keywords" content={keywords} />}
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
  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <SEO
      title="ピックルボールイベント一覧 - 全国の募集情報"
      description="全国のピックルボールイベント・大会情報を掲載。初心者歓迎のイベントから上級者向けトーナメントまで、参加者募集中のイベントを探せます。今すぐ参加しよう！"
      keywords="ピックルボール, ピックルボール イベント, pickleball, イベント募集, 大会, 初心者, コミュニティ, 日本"
      url="/events"
      jsonLd={[organizationJsonLd, websiteJsonLd]}
    />
  );
}

export function TeamsListSEO() {
  return (
    <SEO
      title="サークル一覧"
      description="ピックルボールサークルを探そう。全国のサークルに参加して、仲間と一緒にプレイしましょう。"
      keywords="ピックルボール, サークル, pickleball, サークル募集, メンバー募集"
      url="/teams"
    />
  );
}

export function RankingsSEO() {
  return (
    <SEO
      title="ランキング"
      description="ピックルボールプレイヤーのランキング。アクティブなプレイヤーをチェックしよう。"
      keywords="ピックルボール, ランキング, pickleball, プレイヤー, DUPR"
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
