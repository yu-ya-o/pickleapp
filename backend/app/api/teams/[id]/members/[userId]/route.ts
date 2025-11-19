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
import { UpdateMemberRoleRequest } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
    userId: string;
  };
}

/**
 * PATCH /api/teams/[id]/members/[userId]
 * Update member role (owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Only owner can change roles
    if (team.ownerId !== user.id) {
      throw new ForbiddenError('Only the owner can change member roles');
    }

    // Find target member
    const targetMember = team.members.find((m) => m.userId === params.userId);
    if (!targetMember) {
      throw new NotFoundError('Member not found');
    }

    // Cannot change owner role
    if (targetMember.role === 'owner') {
      throw new BadRequestError('Cannot change owner role');
    }

    const body: UpdateMemberRoleRequest = await request.json();

    if (!['admin', 'member'].includes(body.role)) {
      throw new BadRequestError('Invalid role');
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: targetMember.id },
      data: { role: body.role },
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
    });

    return NextResponse.json({
      id: updatedMember.id,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt.toISOString(),
      user: updatedMember.user,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/teams/[id]/members/[userId]
 * Remove member or leave team
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const targetMember = team.members.find((m) => m.userId === params.userId);
    if (!targetMember) {
      throw new NotFoundError('Member not found');
    }

    // Check permissions
    const isOwner = team.ownerId === user.id;
    const isAdmin = team.members.find((m) => m.userId === user.id && m.role === 'admin');
    const isSelf = params.userId === user.id;

    // Owner can remove anyone (except themselves)
    // Admin can remove members (not owner or other admins)
    // Members can only remove themselves
    if (!isOwner && !isAdmin && !isSelf) {
      throw new ForbiddenError('You do not have permission to remove this member');
    }

    if (isAdmin && targetMember.role === 'owner') {
      throw new ForbiddenError('Cannot remove the owner');
    }

    if (isAdmin && targetMember.role === 'admin' && !isSelf) {
      throw new ForbiddenError('Admins cannot remove other admins');
    }

    // Cannot remove owner
    if (targetMember.role === 'owner') {
      throw new BadRequestError('Cannot remove the owner. Transfer ownership or delete the team instead.');
    }

    await prisma.teamMember.delete({
      where: { id: targetMember.id },
    });

    return NextResponse.json({
      message: isSelf ? 'Left team successfully' : 'Member removed successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
