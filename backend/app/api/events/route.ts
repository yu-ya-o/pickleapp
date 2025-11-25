import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { CreateEventRequest, EventResponse } from '@/lib/types';

/**
 * GET /api/events
 * Get all events with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const userId = searchParams.get('userId'); // Filter by creator
    const upcoming = searchParams.get('upcoming') === 'true';

    const where: any = {};

    if (userId) {
      where.creatorId = userId;
    }

    // Filter logic: Show active events OR closed events that haven't passed yet
    if (upcoming) {
      // For upcoming: show all events in the future (active or completed)
      where.startTime = {
        gte: new Date(),
      };
    } else if (statusParam) {
      // If specific status is requested, use it
      where.status = statusParam;
    } else {
      // Default: show active events OR completed events that are still in the future
      where.OR = [
        { status: 'active' },
        {
          AND: [
            { status: 'completed' },
            { startTime: { gte: new Date() } },
          ],
        },
      ];
    }

    const events = await prisma.event.findMany({
      where,
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
      orderBy: {
        startTime: 'asc',
      },
    });

    // Get current user if authenticated
    const authHeader = request.headers.get('authorization');
    const currentUser = authHeader ? await getUserFromAuth(authHeader) : null;

    const response: EventResponse[] = events.map((event) => ({
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
    }));

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body: CreateEventRequest = await request.json();

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.location ||
      !body.startTime ||
      !body.endTime ||
      !body.maxParticipants ||
      !body.skillLevel
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
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        region: body.region || null,
        startTime,
        endTime,
        maxParticipants: body.maxParticipants,
        price: body.price || null,
        skillLevel: body.skillLevel,
        creatorId: user.id,
      },
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
        reservations: true,
      },
    });

    // Create chat room for the event
    await prisma.chatRoom.create({
      data: {
        eventId: event.id,
      },
    });

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
      reservations: [],
      availableSpots: event.maxParticipants,
      isUserReserved: false,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
