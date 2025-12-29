import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

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
    });

    return event;
  } catch (error) {
    console.error('Failed to fetch team event:', error);
    return null;
  }
}

export default async function TeamEventPage({ params }: TeamEventPageProps) {
  const { teamId, eventId } = await params;
  const event = await getTeamEvent(teamId, eventId);

  if (!event) {
    notFound();
  }

  const deepLink = `picklehub://teams/${teamId}/events/${eventId}`;

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
