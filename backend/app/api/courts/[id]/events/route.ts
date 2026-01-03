import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { errorResponse } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /api/courts/[id]/events
 * Get events happening at this court
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get both regular events and public team events
    const [events, teamEvents] = await Promise.all([
      prisma.event.findMany({
        where: {
          courtId: id,
          status: 'active',
          startTime: {
            gte: new Date(),
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          reservations: {
            where: {
              status: 'confirmed',
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      }),
      prisma.teamEvent.findMany({
        where: {
          courtId: id,
          visibility: 'public',
          status: 'active',
          startTime: {
            gte: new Date(),
          },
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              iconImage: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          participants: {
            where: {
              status: 'confirmed',
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      }),
    ]);

    // Combine and format the results
    const formattedEvents = events.map((event) => ({
      ...event,
      type: 'event',
      participantCount: event.reservations.length,
    }));

    const formattedTeamEvents = teamEvents.map((event) => ({
      ...event,
      type: 'teamEvent',
      participantCount: event.participants.length,
    }));

    const allEvents = [...formattedEvents, ...formattedTeamEvents].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error fetching court events:', error);
    return errorResponse(error);
  }
}
