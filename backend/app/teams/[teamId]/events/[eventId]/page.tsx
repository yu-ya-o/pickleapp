import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = 'https://picklehub.jp';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

interface TeamEventPageProps {
  params: Promise<{
    teamId: string;
    eventId: string;
  }>;
}

async function getTeamEvent(teamId: string, eventId: string) {
  try {
    const event = await prisma.teamEvent.findFirst({
      where: {
        id: eventId,
        teamId: teamId,
      },
      include: {
        team: {
          select: { name: true, iconImage: true },
        },
      },
    });

    return event;
  } catch (error) {
    console.error('Failed to fetch team event:', error);
    return null;
  }
}

export async function generateMetadata({ params }: TeamEventPageProps): Promise<Metadata> {
  const { teamId, eventId } = await params;
  const event = await getTeamEvent(teamId, eventId);

  if (!event) {
    return {
      title: 'イベントが見つかりません | PickleHub',
    };
  }

  const date = new Date(event.startTime).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const title = `${event.title} - ${event.team.name} | PickleHub`;
  const description = `${date}に${event.location}で開催。${event.team.name}主催のピックルボールイベント。${event.description?.slice(0, 80) || ''}`;
  const image = event.team.iconImage || OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/teams/${teamId}/events/${eventId}`,
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

export default async function TeamEventPage({ params }: TeamEventPageProps) {
  const { teamId, eventId } = await params;
  const event = await getTeamEvent(teamId, eventId);

  if (!event) {
    notFound();
  }

  const deepLink = `picklehub://teams/${teamId}/events/${eventId}`;
  const webLink = `${SITE_URL}/teams/${teamId}/events/${eventId}`;

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
          background: 'linear-gradient(to bottom, #eff6ff, white)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px', fontSize: '48px' }}>🎾</div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>
            {event.title}
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>
            {event.team.name} / {new Date(event.startTime).toLocaleDateString('ja-JP')} / {event.location}
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
              backgroundColor: '#3b82f6',
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
              color: '#3b82f6',
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
