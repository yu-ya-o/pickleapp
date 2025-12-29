import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface TeamEventPageProps {
  params: {
    teamId: string;
    eventId: string;
  };
}

async function getTeamEvent(teamId: string, eventId: string) {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        teamId: teamId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            nickname: true,
            profileImage: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            iconImage: true,
            description: true,
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    return event;
  } catch (error) {
    console.error('Failed to fetch team event:', error);
    return null;
  }
}

export default async function TeamEventPage({ params }: TeamEventPageProps) {
  const event = await getTeamEvent(params.teamId, params.eventId);

  if (!event || !event.team) {
    notFound();
  }

  const deepLink = `picklehub://teams/${params.teamId}/events/${params.eventId}`;
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Team Header */}
        <div className="mb-6 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          {event.team.iconImage && (
            <img
              src={event.team.iconImage}
              alt={event.team.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{event.team.name}</h2>
            {event.team.description && (
              <p className="text-sm text-gray-600 mt-1">{event.team.description}</p>
            )}
          </div>
        </div>

        {/* Event Header Image */}
        {event.headerImage && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img
              src={event.headerImage}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Event Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{event.title}</h1>

          <div className="space-y-3 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{event._count.reservations}/{event.maxParticipants}人参加</span>
            </div>

            {event.fee > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>¥{event.fee.toLocaleString()}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="mt-6 text-gray-700 whitespace-pre-wrap">{event.description}</p>
          )}
        </div>

        {/* Open in App Button */}
        <div className="space-y-4">
          <a
            href={deepLink}
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-center text-lg transition-colors"
          >
            アプリで開く
          </a>

          <p className="text-center text-sm text-gray-500">
            PickleHubアプリでイベントの詳細を確認・参加予約ができます
          </p>
        </div>
      </div>

      {/* Auto-redirect script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Attempt to open app automatically on mobile
            (function() {
              const userAgent = navigator.userAgent || navigator.vendor || window.opera;
              const isMobile = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

              if (isMobile) {
                // Try to open the app
                window.location.href = '${deepLink}';

                // Fallback: If app doesn't open after 2 seconds, stay on page
                setTimeout(function() {
                  // User can manually click the button if needed
                }, 2000);
              }
            })();
          `,
        }}
      />
    </main>
  );
}
