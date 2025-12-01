import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';
import { TeamEventResponse } from '@/lib/types';

/**
 * GET /api/public-team-events
 * Get all public team events (visibility='public')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';

    // Get current user if authenticated (for isUserParticipating)
    const authHeader = request.headers.get('authorization');
    const user = authHeader ? await getUserFromAuth(authHeader) : null;

    const where: any = {
      visibility: 'public',
    };

    if (upcoming) {
      where.startTime = {
        gte: new Date(),
      };
    }

    const events = await prisma.teamEvent.findMany({
      where,
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
        isUserParticipating: user
          ? event.participants.some((p) => p.userId === user.id)
          : false,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
