import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, NotFoundError } from '@/lib/errors';
import { TeamResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

/**
 * GET /api/users/[userId]/teams
 * Get teams that a user is a member of (public teams only for privacy)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get teams where user is a member (only public teams for privacy)
    const teams = await prisma.team.findMany({
      where: {
        visibility: 'public',
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            nickname: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response: TeamResponse[] = teams.map((team) => {
      const memberCount = team.members.length;
      const userMembership = team.members.find((m) => m.userId === userId);

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        iconImage: team.iconImage,
        headerImage: team.headerImage,
        region: team.region,
        visibility: team.visibility,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        owner: team.owner,
        memberCount,
        isUserMember: !!userMembership,
        userRole: userMembership?.role,
        instagramUrl: team.instagramUrl,
        twitterUrl: team.twitterUrl,
        tiktokUrl: team.tiktokUrl,
        lineUrl: team.lineUrl,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
