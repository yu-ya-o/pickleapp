import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    return event;
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return null;
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const deepLink = `picklehub://events/${id}`;

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>イベントをアプリで開く</title>
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
            PickleHubで開く
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
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
              cursor: 'pointer'
            }}
          >
            アプリで開く
          </a>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // ページ読み込み後すぐにディープリンクを開く
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
