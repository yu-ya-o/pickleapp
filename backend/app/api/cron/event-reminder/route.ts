import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails, generateEventReminderEmail } from '@/lib/emailService';
import { notifyEventReminder } from '@/lib/notifications';

/**
 * GET /api/cron/event-reminder
 * Send reminder emails to participants of events happening tomorrow
 * This endpoint is designed to be called by Vercel Cron
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

    // Calculate tomorrow's date range (in JST - Japan Standard Time)
    const now = new Date();
    // Convert to JST (UTC+9)
    const jstOffset = 9 * 60 * 60 * 1000;
    const nowJST = new Date(now.getTime() + jstOffset);

    // Get tomorrow's start and end in JST
    const tomorrowStart = new Date(nowJST);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Convert back to UTC for database query
    const tomorrowStartUTC = new Date(tomorrowStart.getTime() - jstOffset);
    const tomorrowEndUTC = new Date(tomorrowEnd.getTime() - jstOffset);

    console.log(`Checking events between ${tomorrowStartUTC.toISOString()} and ${tomorrowEndUTC.toISOString()}`);

    // Find regular events happening tomorrow
    const events = await prisma.event.findMany({
      where: {
        startTime: {
          gte: tomorrowStartUTC,
          lte: tomorrowEndUTC,
        },
        status: 'active',
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
          },
        },
        reservations: {
          where: { status: 'confirmed' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    // Find team events happening tomorrow
    const teamEvents = await prisma.teamEvent.findMany({
      where: {
        startTime: {
          gte: tomorrowStartUTC,
          lte: tomorrowEndUTC,
        },
        status: 'active',
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
          },
        },
        participants: {
          where: { status: 'confirmed' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    const emailsToSend: ReturnType<typeof generateEventReminderEmail>[] = [];
    const processedUserEventPairs = new Set<string>();

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

    // Process regular events
    for (const event of events) {
      const eventDate = formatDateJST(event.startTime);
      const eventTime = `${formatTimeJST(event.startTime)} - ${formatTimeJST(event.endTime)}`;

      // Collect all participants (including creator)
      const participants = new Map<string, { email: string; name: string }>();

      // Add creator
      participants.set(event.creator.id, {
        email: event.creator.email,
        name: event.creator.nickname || event.creator.name,
      });

      // Add reservations
      for (const reservation of event.reservations) {
        participants.set(reservation.user.id, {
          email: reservation.user.email,
          name: reservation.user.nickname || reservation.user.name,
        });
      }

      // Generate emails for each participant
      for (const entry of Array.from(participants.entries())) {
        const [userId, participant] = entry;
        const pairKey = `${userId}-${event.id}`;
        if (processedUserEventPairs.has(pairKey)) continue;
        processedUserEventPairs.add(pairKey);

        emailsToSend.push(
          generateEventReminderEmail({
            recipientEmail: participant.email,
            recipientName: participant.name,
            eventTitle: event.title,
            eventDate,
            eventTime,
            eventLocation: event.location,
            eventAddress: event.address || undefined,
          })
        );
      }

      // Also send push notification
      await notifyEventReminder(event.id, event.title, 24);
    }

    // Process team events
    for (const event of teamEvents) {
      const eventDate = formatDateJST(event.startTime);
      const eventTime = `${formatTimeJST(event.startTime)} - ${formatTimeJST(event.endTime)}`;

      // Collect all participants (including creator)
      const participants = new Map<string, { email: string; name: string }>();

      // Add creator
      participants.set(event.creator.id, {
        email: event.creator.email,
        name: event.creator.nickname || event.creator.name,
      });

      // Add participants
      for (const participant of event.participants) {
        participants.set(participant.user.id, {
          email: participant.user.email,
          name: participant.user.nickname || participant.user.name,
        });
      }

      // Generate emails for each participant
      for (const entry of Array.from(participants.entries())) {
        const [userId, participant] = entry;
        const pairKey = `${userId}-team-${event.id}`;
        if (processedUserEventPairs.has(pairKey)) continue;
        processedUserEventPairs.add(pairKey);

        emailsToSend.push(
          generateEventReminderEmail({
            recipientEmail: participant.email,
            recipientName: participant.name,
            eventTitle: event.title,
            eventDate,
            eventTime,
            eventLocation: event.location,
            eventAddress: event.address || undefined,
          })
        );
      }
    }

    // Send all emails
    console.log(`Sending ${emailsToSend.length} reminder emails...`);
    const result = await sendBulkEmails(emailsToSend);

    const response = {
      success: true,
      eventsProcessed: events.length + teamEvents.length,
      emailsSent: result.sent,
      emailsFailed: result.failed,
      timestamp: new Date().toISOString(),
    };

    console.log('Event reminder cron completed:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Event reminder cron error:', error);
    return NextResponse.json(
      { error: 'Failed to send event reminders', details: String(error) },
      { status: 500 }
    );
  }
}
