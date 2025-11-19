import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '@/lib/errors';
import { ValidateInviteResponse } from '@/lib/types';

interface RouteParams {
  params: {
    token: string;
  };
}

/**
 * GET /api/teams/invites/[token]
 * Validate invite token and show team info
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const invite = await prisma.teamInviteUrl.findUnique({
      where: { token: params.token },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid invite link',
      } as ValidateInviteResponse);
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: 'Invite link has expired',
      } as ValidateInviteResponse);
    }

    // Check if already used
    if (invite.usedAt) {
      return NextResponse.json({
        valid: false,
        error: 'Invite link has already been used',
      } as ValidateInviteResponse);
    }

    const response: ValidateInviteResponse = {
      valid: true,
      team: {
        id: invite.team.id,
        name: invite.team.name,
        description: invite.team.description,
        iconImage: invite.team.iconImage,
        memberCount: invite.team.members.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/teams/invites/[token]
 * Use invite to request join (creates join request)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const invite = await prisma.teamInviteUrl.findUnique({
      where: { token: params.token },
      include: {
        team: {
          include: {
            members: true,
            joinRequests: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundError('Invalid invite link');
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      throw new BadRequestError('Invite link has expired');
    }

    // Check if already used
    if (invite.usedAt) {
      throw new BadRequestError('Invite link has already been used');
    }

    // Check if already a member
    const isMember = invite.team.members.some((m) => m.userId === user.id);
    if (isMember) {
      throw new BadRequestError('You are already a member of this team');
    }

    // Check if already has a pending request
    const hasPendingRequest = invite.team.joinRequests.some(
      (req) => req.status === 'pending'
    );
    if (hasPendingRequest) {
      throw new BadRequestError('You already have a pending join request');
    }

    // Mark invite as used
    await prisma.teamInviteUrl.update({
      where: { id: invite.id },
      data: {
        usedAt: new Date(),
        usedBy: user.id,
      },
    });

    // Create join request
    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        teamId: invite.teamId,
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

    return NextResponse.json({
      message: 'Join request submitted successfully',
      joinRequest: {
        id: joinRequest.id,
        status: joinRequest.status,
        createdAt: joinRequest.createdAt.toISOString(),
        team: joinRequest.team,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
