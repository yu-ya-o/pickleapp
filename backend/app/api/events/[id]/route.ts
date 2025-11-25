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
import { notifyEventUpdated, notifyEventCancelledByCreator } from '@/lib/notifications';

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
            bio: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            skillLevel: true,
            duprDoubles: true,
            duprSingles: true,
            myPaddle: true,
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
                bio: true,
                region: true,
                pickleballExperience: true,
                gender: true,
                skillLevel: true,
            duprDoubles: true,
            duprSingles: true,
            myPaddle: true,
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
      price: event.price,
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

    // Track changed fields for notifications
    const changedFields: string[] = [];

    // Prepare update data
    const updateData: any = {};

    if (body.title && body.title !== event.title) {
      updateData.title = body.title;
      changedFields.push('タイトル');
    }
    if (body.description && body.description !== event.description) {
      updateData.description = body.description;
      changedFields.push('説明');
    }
    if (body.location && body.location !== event.location) {
      updateData.location = body.location;
      changedFields.push('場所');
    }
    if (body.region !== undefined && body.region !== event.region) {
      updateData.region = body.region;
      changedFields.push('地域');
    }
    if (body.skillLevel && body.skillLevel !== event.skillLevel) {
      updateData.skillLevel = body.skillLevel;
      changedFields.push('レベル');
    }
    if (body.maxParticipants && body.maxParticipants !== event.maxParticipants) {
      updateData.maxParticipants = body.maxParticipants;
      changedFields.push('定員');
    }
    if (body.status && body.status !== event.status) {
      updateData.status = body.status;
      changedFields.push('ステータス');
    }
    if (body.price !== undefined && body.price !== event.price) {
      updateData.price = body.price;
      changedFields.push('料金');
    }

    if (body.startTime) {
      const newStartTime = new Date(body.startTime);
      if (newStartTime.getTime() !== event.startTime.getTime()) {
        updateData.startTime = newStartTime;
        changedFields.push('開始時間');
      }
    }

    if (body.endTime) {
      const newEndTime = new Date(body.endTime);
      if (newEndTime.getTime() !== event.endTime.getTime()) {
        updateData.endTime = newEndTime;
        changedFields.push('終了時間');
      }
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
            bio: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            skillLevel: true,
            duprDoubles: true,
            duprSingles: true,
            myPaddle: true,
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
                bio: true,
                region: true,
                pickleballExperience: true,
                gender: true,
                skillLevel: true,
            duprDoubles: true,
            duprSingles: true,
            myPaddle: true,
                isProfileComplete: true,
              },
            },
          },
        },
      },
    });

    // Send notification if important fields changed
    if (changedFields.length > 0) {
      notifyEventUpdated(id, updatedEvent.title, changedFields).catch((error) => {
        console.error('Failed to send event updated notification:', error);
      });
    }

    const response: EventResponse = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      location: updatedEvent.location,
      region: updatedEvent.region,
      startTime: updatedEvent.startTime.toISOString(),
      endTime: updatedEvent.endTime.toISOString(),
      maxParticipants: updatedEvent.maxParticipants,
      price: updatedEvent.price,
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

    // Send notification to participants before deleting
    notifyEventCancelledByCreator(id, event.title).catch((error) => {
      console.error('Failed to send event cancelled notification:', error);
    });

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
