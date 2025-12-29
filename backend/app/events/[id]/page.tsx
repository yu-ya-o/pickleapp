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
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=${deepLink}`} />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = '${deepLink}';`,
          }}
        />
        <noscript>
          <p>アプリにリダイレクト中...</p>
          <a href="${deepLink}">アプリで開く</a>
        </noscript>
      </body>
    </html>
  );
}
