import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = 'https://picklehub.jp';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

async function getTeam(teamId: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return team;
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return null;
  }
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const team = await getTeam(teamId);

  if (!team) {
    return {
      title: 'サークルが見つかりません | PickleHub',
    };
  }

  const title = `${team.name} | PickleHub`;
  const regionText = team.region ? `${team.region}の` : '';
  const description = `${team.name}は${regionText}ピックルボールサークルです。メンバー${team._count.members}人。${team.description?.slice(0, 80) || 'PickleHubでサークルに参加しよう！'}`;
  const image = team.iconImage || OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/teams/${teamId}`,
      siteName: 'PickleHub',
      images: [{ url: image, width: 1200, height: 630 }],
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const team = await getTeam(teamId);

  if (!team) {
    notFound();
  }

  const deepLink = `picklehub://teams/${teamId}`;
  const webLink = `${SITE_URL}/teams/${teamId}`;

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'linear-gradient(to bottom, #f0fdf4, white)',
          textAlign: 'center'
        }}>
          {team.iconImage ? (
            <img
              src={team.iconImage}
              alt={team.name}
              style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '20px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ marginBottom: '20px', fontSize: '48px' }}>🏓</div>
          )}
          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>
            {team.name}
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>
            {team.region || 'ピックルボールサークル'} / メンバー{team._count.members}人
          </p>
          <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>
            アプリが開かない場合は下のボタンをタップしてください
          </p>
          <a
            href={deepLink}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '300px',
              padding: '16px 24px',
              backgroundColor: '#65a30d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            アプリで開く
          </a>
          <a
            href={webLink}
            style={{
              fontSize: '14px',
              color: '#65a30d',
              textDecoration: 'underline',
            }}
          >
            Webで見る
          </a>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                setTimeout(function() {
                  window.location.href = '${deepLink}';
                }, 100);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
