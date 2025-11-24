import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';
import { UpdateTeamEventRequest, TeamEventResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

/**
 * GET /api/teams/[id]/events/[eventId]
 * Get team event details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const event = await prisma.teamEvent.findUnique({
      where: { id: eventId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            iconImage: true,
            headerImage: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
            nickname: true,
            bio: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            skillLevel: true,
            isProfileComplete: true,
          },
        },
        participants: {
          where: {
            status: 'confirmed',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
                nickname: true,
                bio: true,
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

    if (event.teamId !== id) {
      throw new ForbiddenError('Event does not belong to this team');
    }

    // Check access: either user is a member, or event is public
    const isMember = team.members.some((m) => m.userId === user.id);
    const isPublicEvent = event.visibility === 'public';

    if (!isMember && !isPublicEvent) {
      throw new ForbiddenError('Only team members can view private team events');
    }

    const participantCount = event.participants.length;
    const availableSpots = event.maxParticipants
      ? event.maxParticipants - participantCount
      : null;

    const response: TeamEventResponse = {
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
      visibility: event.visibility,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      team: event.team,
      creator: event.creator,
      participants: event.participants.map((p) => ({
        id: p.id,
        status: p.status,
        joinedAt: p.joinedAt.toISOString(),
        user: p.user,
      })),
      participantCount,
      availableSpots,
      isUserParticipating: event.participants.some((p) => p.userId === user.id),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/teams/[id]/events/[eventId]
 * Update team event (creator/owner/admin)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const event = await prisma.teamEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.teamId !== id) {
      throw new ForbiddenError('Event does not belong to this team');
    }

    // Check permissions: creator, owner, or admin can edit
    const userMembership = team.members.find((m) => m.userId === user.id);
    const isCreator = event.createdBy === user.id;
    const isOwnerOrAdmin =
      userMembership && ['owner', 'admin'].includes(userMembership.role);

    if (!isCreator && !isOwnerOrAdmin) {
      throw new ForbiddenError(
        'Only the creator, owner, or admin can update this event'
      );
    }

    const body: UpdateTeamEventRequest = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.maxParticipants !== undefined)
      updateData.maxParticipants = body.maxParticipants;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.skillLevel !== undefined) updateData.skillLevel = body.skillLevel;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;

    if (body.startTime !== undefined) {
      updateData.startTime = new Date(body.startTime);
    }

    if (body.endTime !== undefined) {
      updateData.endTime = new Date(body.endTime);
    }

    const updatedEvent = await prisma.teamEvent.update({
      where: { id: eventId },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            iconImage: true,
            headerImage: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
            nickname: true,
            bio: true,
            region: true,
            pickleballExperience: true,
            gender: true,
            skillLevel: true,
            isProfileComplete: true,
          },
        },
        participants: {
          where: {
            status: 'confirmed',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
                nickname: true,
                bio: true,
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

    const participantCount = updatedEvent.participants.length;
    const availableSpots = updatedEvent.maxParticipants
      ? updatedEvent.maxParticipants - participantCount
      : null;

    const response: TeamEventResponse = {
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
      visibility: updatedEvent.visibility,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
      team: updatedEvent.team,
      creator: updatedEvent.creator,
      participants: updatedEvent.participants.map((p) => ({
        id: p.id,
        status: p.status,
        joinedAt: p.joinedAt.toISOString(),
        user: p.user,
      })),
      participantCount,
      availableSpots,
      isUserParticipating: updatedEvent.participants.some(
        (p) => p.userId === user.id
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/teams/[id]/events/[eventId]
 * Delete team event (creator/owner/admin)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const event = await prisma.teamEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.teamId !== id) {
      throw new ForbiddenError('Event does not belong to this team');
    }

    // Check permissions
    const userMembership = team.members.find((m) => m.userId === user.id);
    const isCreator = event.createdBy === user.id;
    const isOwnerOrAdmin =
      userMembership && ['owner', 'admin'].includes(userMembership.role);

    if (!isCreator && !isOwnerOrAdmin) {
      throw new ForbiddenError(
        'Only the creator, owner, or admin can delete this event'
      );
    }

    await prisma.teamEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
