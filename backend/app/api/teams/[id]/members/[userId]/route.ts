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
  params: Promise<{
    id: string;
    userId: string;
  }>;
}

/**
 * PATCH /api/teams/[id]/members/[userId]
 * Update member role
 * Permissions:
 * - Owner: Can change any role (including transferring ownership)
 * - Admin: Can change admin and member roles only
 * - Member: Cannot change roles
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, userId } = await params;
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

    // Find current user's membership
    const currentUserMember = team.members.find((m) => m.userId === user.id);
    if (!currentUserMember) {
      throw new ForbiddenError('You are not a member of this team');
    }

    const isOwner = team.ownerId === user.id;
    const isAdmin = currentUserMember.role === 'admin';

    // Check permissions - only owner and admin can change roles
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to change member roles');
    }

    // Find target member
    const targetMember = team.members.find((m) => m.userId === userId);
    if (!targetMember) {
      throw new NotFoundError('Member not found');
    }

    const body: UpdateMemberRoleRequest = await request.json();
    const newRole = body.role as 'owner' | 'admin' | 'member';

    if (!['owner', 'admin', 'member'].includes(newRole)) {
      throw new BadRequestError('Invalid role');
    }

    // Check for ownership transfer first
    if (newRole === 'owner') {
      if (!isOwner) {
        throw new ForbiddenError('Only the owner can transfer ownership');
      }

      // Transfer ownership
      await prisma.$transaction([
        // Set current owner to admin
        prisma.teamMember.update({
          where: { id: currentUserMember.id },
          data: { role: 'admin' },
        }),
        // Set new owner
        prisma.teamMember.update({
          where: { id: targetMember.id },
          data: { role: 'owner' },
        }),
        // Update team owner
        prisma.team.update({
          where: { id },
          data: { ownerId: userId },
        }),
      ]);

      const updatedMember = await prisma.teamMember.findUnique({
        where: { id: targetMember.id },
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
        },
      });

      return NextResponse.json({
        id: updatedMember!.id,
        role: updatedMember!.role,
        joinedAt: updatedMember!.joinedAt.toISOString(),
        user: updatedMember!.user,
      });
    }

    // Permission checks for non-owner role changes
    if (isAdmin && !isOwner) {
      // Admin can only change admin and member roles (not the owner)
      if (targetMember.role === 'owner') {
        throw new ForbiddenError('Only the owner can change the owner role');
      }
    }

    // Regular role update
    const updatedMember = await prisma.teamMember.update({
      where: { id: targetMember.id },
      data: { role: newRole },
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
    const { id, userId } = await params;
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

    const targetMember = team.members.find((m) => m.userId === userId);
    if (!targetMember) {
      throw new NotFoundError('Member not found');
    }

    // Check permissions
    const isOwner = team.ownerId === user.id;
    const isAdmin = team.members.find((m) => m.userId === user.id && m.role === 'admin');
    const isSelf = userId === user.id;

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
