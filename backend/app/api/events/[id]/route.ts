import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';
import { UpdateEventRequest, EventResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/events/[id]
 * Get a single event by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            nickname: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            skillLevel: true,
            isProfileComplete: true,
          },
        },
        reservations: {
          where: {
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
                skillLevel: true,
                isProfileComplete: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Get current user if authenticated
    const authHeader = request.headers.get('authorization');
    const currentUser = authHeader ? await getUserFromAuth(authHeader) : null;

    const response: EventResponse = {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      region: event.region,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      maxParticipants: event.maxParticipants,
      skillLevel: event.skillLevel,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      creator: event.creator,
      reservations: event.reservations.map((r) => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        eventId: r.eventId,
      })),
      availableSpots: event.maxParticipants - event.reservations.length,
      isUserReserved: currentUser
        ? event.reservations.some((r) => r.userId === currentUser.id)
        : false,
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/events/[id]
 * Update an event
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Only creator can update event
    if (event.creatorId !== user.id) {
      throw new ForbiddenError('Only the creator can update this event');
    }

    const body: UpdateEventRequest = await request.json();

    // Prepare update data
    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.location) updateData.location = body.location;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.skillLevel) updateData.skillLevel = body.skillLevel;
    if (body.maxParticipants) updateData.maxParticipants = body.maxParticipants;
    if (body.status) updateData.status = body.status;

    if (body.startTime) {
      updateData.startTime = new Date(body.startTime);
    }

    if (body.endTime) {
      updateData.endTime = new Date(body.endTime);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            nickname: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            skillLevel: true,
            isProfileComplete: true,
          },
        },
        reservations: {
          where: {
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
                skillLevel: true,
                isProfileComplete: true,
              },
            },
          },
        },
      },
    });

    const response: EventResponse = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      location: updatedEvent.location,
      region: updatedEvent.region,
      startTime: updatedEvent.startTime.toISOString(),
      endTime: updatedEvent.endTime.toISOString(),
      maxParticipants: updatedEvent.maxParticipants,
      skillLevel: updatedEvent.skillLevel,
      status: updatedEvent.status,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
      creator: updatedEvent.creator,
      reservations: updatedEvent.reservations.map((r) => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        eventId: r.eventId,
      })),
      availableSpots:
        updatedEvent.maxParticipants - updatedEvent.reservations.length,
      isUserReserved: updatedEvent.reservations.some(
        (r) => r.userId === user.id
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Only creator can delete event
    if (event.creatorId !== user.id) {
      throw new ForbiddenError('Only the creator can delete this event');
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
