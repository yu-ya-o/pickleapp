import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/teams/[id]/members
 * Get team members
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    const currentUser = authHeader ? await getUserFromAuth(authHeader) : null;

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
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
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if user is a member (for private teams)
    const userMembership = currentUser
      ? team.members.find((m) => m.userId === currentUser.id)
      : undefined;

    if (team.visibility === 'private' && !userMembership) {
      throw new ForbiddenError('This team is private');
    }

    const members = team.members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    }));

    return NextResponse.json(members);
  } catch (error) {
    return errorResponse(error);
  }
}
