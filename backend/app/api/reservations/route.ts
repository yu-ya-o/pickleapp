import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { CreateReservationRequest, ReservationResponse } from '@/lib/types';
import { notifyEventJoined } from '@/lib/notifications';

/**
 * POST /api/reservations
 * Create a new reservation
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body: CreateReservationRequest = await request.json();

    if (!body.eventId) {
      throw new BadRequestError('eventId is required');
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: body.eventId },
      include: {
        reservations: {
          where: {
            status: 'confirmed',
          },
        },
      },
    });

    if (!event) {
      throw new BadRequestError('Event not found');
    }

    // Check if event is active
    if (event.status !== 'active') {
      throw new BadRequestError('Event is not active');
    }

    // Check if event is full
    if (event.reservations.length >= event.maxParticipants) {
      throw new BadRequestError('Event is full');
    }

    // Check if user already reserved
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: body.eventId,
        },
      },
    });

    if (existingReservation && existingReservation.status === 'confirmed') {
      throw new BadRequestError('You already have a reservation for this event');
    }

    // Create or update reservation
    const reservation = await prisma.reservation.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: body.eventId,
        },
      },
      create: {
        userId: user.id,
        eventId: body.eventId,
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
            email: true,
            profileImage: true,
            nickname: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            ageGroup: true,
            skillLevel: true,
            isProfileComplete: true,
          },
        },
      },
    });

    // Send notification to event creator
    notifyEventJoined(body.eventId, user.nickname || user.name, event.title).catch((error) => {
      console.error('Failed to send event joined notification:', error);
    });

    const response: ReservationResponse = {
      id: reservation.id,
      status: reservation.status,
      createdAt: reservation.createdAt.toISOString(),
      user: reservation.user,
      eventId: reservation.eventId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/reservations
 * Get user's reservations
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: user.id,
        status: 'confirmed',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            nickname: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            ageGroup: true,
            skillLevel: true,
            isProfileComplete: true,
          },
        },
        event: {
          include: {
            creator: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response: ReservationResponse[] = reservations.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      eventId: r.eventId,
    }));

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
