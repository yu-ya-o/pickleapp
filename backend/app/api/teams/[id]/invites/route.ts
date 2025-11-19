import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';
import { TeamInviteUrlResponse } from '@/lib/types';
import { randomBytes } from 'crypto';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/teams/[id]/invites
 * Generate invite URL (owner/admin only)
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
      throw new ForbiddenError('Only owner and admin can generate invite URLs');
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');

    // Expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const invite = await prisma.teamInviteUrl.create({
      data: {
        teamId: id,
        token,
        expiresAt,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Generate full invite URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    const response: TeamInviteUrlResponse = {
      id: invite.id,
      token: invite.token,
      inviteUrl,
      expiresAt: invite.expiresAt.toISOString(),
      usedAt: invite.usedAt ? invite.usedAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
      createdBy: invite.creator,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/teams/[id]/invites
 * Get all invites for team (owner/admin only)
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

    // Check if user is owner or admin
    const userMembership = team.members.find((m) => m.userId === user.id);
    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      throw new ForbiddenError('Only owner and admin can view invite URLs');
    }

    const invites = await prisma.teamInviteUrl.findMany({
      where: {
        teamId: id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        usedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response: TeamInviteUrlResponse[] = invites.map((invite) => ({
      id: invite.id,
      token: invite.token,
      inviteUrl: `${baseUrl}/invite/${invite.token}`,
      expiresAt: invite.expiresAt.toISOString(),
      usedAt: invite.usedAt ? invite.usedAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
      createdBy: invite.creator,
      usedBy: invite.usedByUser || undefined,
    }));

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
