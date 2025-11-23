import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { CreateTeamRequest, TeamResponse } from '@/lib/types';

/**
 * GET /api/teams
 * Get teams (public teams + user's teams)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region') || '';
    const myTeams = searchParams.get('myTeams') === 'true';

    const authHeader = request.headers.get('authorization');
    const currentUser = authHeader ? await getUserFromAuth(authHeader) : null;

    let where: any = {};

    if (myTeams && currentUser) {
      // Get teams where user is a member
      where = {
        members: {
          some: {
            userId: currentUser.id,
          },
        },
      };
    } else {
      // Get public teams only
      where = {
        visibility: 'public',
      };
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add region filter
    if (region) {
      where.region = region;
    }

    const teams = await prisma.team.findMany({
      where,
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
      const userMembership = currentUser
        ? team.members.find((m) => m.userId === currentUser.id)
        : undefined;

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        iconImage: team.iconImage,
        region: team.region,
        visibility: team.visibility,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        owner: team.owner,
        memberCount,
        isUserMember: !!userMembership,
        userRole: userMembership?.role,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/teams
 * Create a new team
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body: CreateTeamRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.visibility) {
      throw new BadRequestError('Missing required fields');
    }

    if (!['public', 'private'].includes(body.visibility)) {
      throw new BadRequestError('Invalid visibility value');
    }

    // Create team and add owner as member
    const team = await prisma.team.create({
      data: {
        name: body.name,
        description: body.description,
        iconImage: body.iconImage || null,
        region: body.region || null,
        visibility: body.visibility,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
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
    });

    // Create chat room for the team
    await prisma.teamChatRoom.create({
      data: {
        teamId: team.id,
      },
    });

    const response: TeamResponse = {
      id: team.id,
      name: team.name,
      description: team.description,
      iconImage: team.iconImage,
      region: team.region,
      visibility: team.visibility,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      owner: team.owner,
      memberCount: team.members.length,
      isUserMember: true,
      userRole: 'owner',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
