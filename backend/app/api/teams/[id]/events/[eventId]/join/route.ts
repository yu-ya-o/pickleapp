import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/lib/errors';

interface RouteParams {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

/**
 * POST /api/teams/[id]/events/[eventId]/join
 * Join team event
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, eventId } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if user is a member
    const isMember = team.members.some((m) => m.userId === user.id);
    if (!isMember) {
      throw new ForbiddenError('Only team members can join team events');
    }

    const event = await prisma.teamEvent.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          where: {
            status: 'confirmed',
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.teamId !== id) {
      throw new ForbiddenError('Event does not belong to this team');
    }

    // Check if event is full
    if (
      event.maxParticipants &&
      event.participants.length >= event.maxParticipants
    ) {
      throw new BadRequestError('Event is full');
    }

    // Check if already participating
    const existingParticipation = await prisma.teamEventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    if (existingParticipation && existingParticipation.status === 'confirmed') {
      throw new BadRequestError('You are already participating in this event');
    }

    // Join event
    const participation = await prisma.teamEventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
      create: {
        eventId,
        userId: user.id,
        status: 'confirmed',
      },
      update: {
        status: 'confirmed',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Successfully joined event',
      participation: {
        id: participation.id,
        status: participation.status,
        joinedAt: participation.joinedAt.toISOString(),
        user: participation.user,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/teams/[id]/events/[eventId]/join
 * Leave team event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const participation = await prisma.teamEventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    if (!participation) {
      throw new NotFoundError('You are not participating in this event');
    }

    await prisma.teamEventParticipant.update({
      where: { id: participation.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ message: 'Successfully left event' });
  } catch (error) {
    return errorResponse(error);
  }
}
