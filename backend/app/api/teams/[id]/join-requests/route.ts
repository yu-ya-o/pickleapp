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
import { TeamJoinRequestResponse } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/teams/[id]/join-requests
 * Get pending join requests (owner/admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
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
      throw new ForbiddenError('Only owner and admin can view join requests');
    }

    const joinRequests = await prisma.teamJoinRequest.findMany({
      where: {
        teamId: params.id,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            iconImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response: TeamJoinRequestResponse[] = joinRequests.map((req) => ({
      id: req.id,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
      team: req.team,
      user: req.user,
    }));

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/teams/[id]/join-requests
 * Request to join team
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: true,
        joinRequests: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if already a member
    const isMember = team.members.some((m) => m.userId === user.id);
    if (isMember) {
      throw new BadRequestError('You are already a member of this team');
    }

    // Check if already has a pending request
    const hasPendingRequest = team.joinRequests.some(
      (req) => req.status === 'pending'
    );
    if (hasPendingRequest) {
      throw new BadRequestError('You already have a pending join request');
    }

    // Create join request
    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        teamId: params.id,
        userId: user.id,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            iconImage: true,
          },
        },
      },
    });

    const response: TeamJoinRequestResponse = {
      id: joinRequest.id,
      status: joinRequest.status,
      createdAt: joinRequest.createdAt.toISOString(),
      updatedAt: joinRequest.updatedAt.toISOString(),
      team: joinRequest.team,
      user: joinRequest.user,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
