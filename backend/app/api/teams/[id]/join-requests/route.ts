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
import { notifyTeamJoinRequest } from '@/lib/notifications';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/teams/[id]/join-requests
 * Get pending join requests (owner/admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    console.log(`🔍 GET /api/teams/${id}/join-requests - User: ${user.email}`);

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
    console.log(`   User role in team: ${userMembership?.role || 'not a member'}`);

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      throw new ForbiddenError('Only owner and admin can view join requests');
    }

    const joinRequests = await prisma.teamJoinRequest.findMany({
      where: {
        teamId: id,
        status: 'pending',
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

    console.log(`   Found ${joinRequests.length} pending join requests`);
    joinRequests.forEach((req) => {
      console.log(`      - ${req.user.name} (${req.user.email}) - Status: ${req.status}`);
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
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    console.log(`📝 POST /api/teams/${id}/join-requests - User: ${user.email}`);

    const team = await prisma.team.findUnique({
      where: { id },
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

    console.log(`   Team: ${team.name}`);

    // Check if already a member
    const isMember = team.members.some((m) => m.userId === user.id);
    if (isMember) {
      console.log(`   ❌ User is already a member`);
      throw new BadRequestError('You are already a member of this team');
    }

    // Check if already has any join request
    const existingRequest = team.joinRequests[0]; // We only queried for this user's requests

    let joinRequest;

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        console.log(`   ⚠️ User already has a pending join request`);
        throw new BadRequestError('You already have a pending join request');
      }

      // Update existing request back to pending (for rejected/approved requests)
      console.log(`   ♻️ Updating existing ${existingRequest.status} request to pending`);
      joinRequest = await prisma.teamJoinRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'pending',
          updatedAt: new Date(),
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
          team: {
            select: {
              id: true,
              name: true,
              iconImage: true,
            },
          },
        },
      });
      console.log(`   ✅ Join request updated: ID=${joinRequest.id}, Status=${joinRequest.status}`);
    } else {
      // Create new join request
      joinRequest = await prisma.teamJoinRequest.create({
        data: {
          teamId: id,
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
              nickname: true,
              region: true,
              pickleballExperience: true,
              gender: true,
              skillLevel: true,
              isProfileComplete: true,
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
      console.log(`   ✅ Join request created: ID=${joinRequest.id}, Status=${joinRequest.status}`);
    }

    // Send notification to team owner and admins
    notifyTeamJoinRequest(id, user.name, team.name).catch((error) => {
      console.error('Failed to send team join request notification:', error);
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
