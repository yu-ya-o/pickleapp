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
import { CreateTeamEventRequest, TeamEventResponse } from '@/lib/types';
import { notifyTeamEventCreated } from '@/lib/notifications';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/teams/[id]/events
 * Get team events (members only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // If user is not a member, only show public events
    // If user is a member, show all events
    const events = await prisma.teamEvent.findMany({
      where: {
        teamId: id,
        ...(isMember ? {} : { visibility: 'public' }),
      },
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
            ageGroup: true,
            skillLevel: true,
            duprDoubles: true,
            duprSingles: true,
            myPaddle: true,
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
                ageGroup: true,
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
      orderBy: {
        startTime: 'asc',
      },
    });

    const response: TeamEventResponse[] = events.map((event) => {
      const participantCount = event.participants.length;
      const availableSpots = event.maxParticipants
        ? event.maxParticipants - participantCount
        : null;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        address: event.address,
        latitude: event.latitude,
        longitude: event.longitude,
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
    });

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/teams/[id]/events
 * Create team event (owner/admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Check if user is owner or admin
    const userMembership = team.members.find((m) => m.userId === user.id);
    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      throw new ForbiddenError('Only owner and admin can create team events');
    }

    const body: CreateTeamEventRequest = await request.json();

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.location ||
      !body.startTime ||
      !body.endTime
    ) {
      throw new BadRequestError('Missing required fields');
    }

    // Validate dates
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    if (startTime >= endTime) {
      throw new BadRequestError('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestError('Start time must be in the future');
    }

    // Create event
    const event = await prisma.teamEvent.create({
      data: {
        teamId: id,
        createdBy: user.id,
        title: body.title,
        description: body.description,
        location: body.location,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        region: body.region || null,
        startTime,
        endTime,
        maxParticipants: body.maxParticipants || null,
        price: body.price || null,
        skillLevel: body.skillLevel || 'all',
        visibility: body.visibility || 'private',
      },
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
            ageGroup: true,
            skillLevel: true,
            duprDoubles: true,
            duprSingles: true,
            myPaddle: true,
            isProfileComplete: true,
          },
        },
        participants: true,
      },
    });

    // Send notification to all team members
    notifyTeamEventCreated(id, event.title, event.id).catch((error) => {
      console.error('Failed to send team event created notification:', error);
    });

    const response: TeamEventResponse = {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
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
      participants: [],
      participantCount: 0,
      availableSpots: event.maxParticipants,
      isUserParticipating: false,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
