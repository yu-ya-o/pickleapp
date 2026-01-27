import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails, generateWeeklyTeamEventsEmail } from '@/lib/emailService';

/**
 * GET /api/cron/weekly-team-events
 * Send weekly digest emails with upcoming team events to all team members
 * This endpoint is designed to be called by Vercel Cron every Wednesday at 21:00 JST
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (via header or URL parameter)
    const authHeader = request.headers.get('authorization');
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const isAuthorized =
      !process.env.CRON_SECRET ||
      authHeader === `Bearer ${process.env.CRON_SECRET}` ||
      urlSecret === process.env.CRON_SECRET;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time in JST
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const nowJST = new Date(now.getTime() + jstOffset);

    console.log(`Weekly team events cron started at ${nowJST.toISOString()} JST`);

    // Helper function to format date/time in JST
    const formatDateJST = (date: Date) => {
      return date.toLocaleDateString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    };

    const formatTimeJST = (date: Date) => {
      return date.toLocaleTimeString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // Web URL for event links
    const webUrl = process.env.WEB_URL || 'https://picklehub.jp';

    // Get all users who are members of at least one team
    const usersWithTeams = await prisma.user.findMany({
      where: {
        teamMemberships: {
          some: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        teamMemberships: {
          select: {
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${usersWithTeams.length} users with team memberships`);

    const emailsToSend: ReturnType<typeof generateWeeklyTeamEventsEmail>[] = [];
    let usersProcessed = 0;

    for (const user of usersWithTeams) {
      const teamIds = user.teamMemberships.map(m => m.teamId);
      const teamMap = new Map(user.teamMemberships.map(m => [m.teamId, m.team.name]));

      // Get upcoming team events for user's teams (next 30 days, limit 5, sorted by startTime)
      const upcomingEvents = await prisma.teamEvent.findMany({
        where: {
          teamId: {
            in: teamIds,
          },
          startTime: {
            gte: now,
          },
          status: 'active',
        },
        orderBy: {
          startTime: 'asc',
        },
        take: 5,
        select: {
          id: true,
          title: true,
          location: true,
          address: true,
          startTime: true,
          endTime: true,
          teamId: true,
        },
      });

      // Skip if no upcoming events
      if (upcomingEvents.length === 0) {
        continue;
      }

      const eventData = upcomingEvents.map(event => ({
        teamName: teamMap.get(event.teamId) || '',
        eventTitle: event.title,
        eventDate: formatDateJST(event.startTime),
        eventTime: `${formatTimeJST(event.startTime)} - ${formatTimeJST(event.endTime)}`,
        eventLocation: event.location,
        eventAddress: event.address || undefined,
        eventUrl: `${webUrl}/teams/${event.teamId}/events/${event.id}`,
      }));

      emailsToSend.push(
        generateWeeklyTeamEventsEmail({
          recipientEmail: user.email,
          recipientName: user.nickname || user.name,
          events: eventData,
        })
      );

      usersProcessed++;
    }

    console.log(`Sending ${emailsToSend.length} weekly digest emails...`);

    // Send all emails
    const result = await sendBulkEmails(emailsToSend);

    const response = {
      success: true,
      usersProcessed,
      emailsSent: result.sent,
      emailsFailed: result.failed,
      timestamp: new Date().toISOString(),
    };

    console.log('Weekly team events cron completed:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weekly team events cron error:', error);
    return NextResponse.json(
      { error: 'Failed to send weekly team event emails', details: String(error) },
      { status: 500 }
    );
  }
}
