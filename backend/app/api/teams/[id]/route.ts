import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';
import { UpdateTeamRequest, TeamResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/teams/[id]
 * Get team details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const currentUser = authHeader ? await getUserFromAuth(authHeader) : null;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profileImage: true,
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
                nickname: true,
                region: true,
                pickleballExperience: true,
                gender: true,
                skillLevel: true,
                isProfileComplete: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check access permissions
    const userMembership = currentUser
      ? team.members.find((m) => m.userId === currentUser.id)
      : undefined;

    // Private teams can only be viewed by members
    if (team.visibility === 'private' && !userMembership) {
      throw new ForbiddenError('This team is private');
    }

    // Check if current user has pending join request
    let hasPendingJoinRequest = false;
    if (currentUser && !userMembership) {
      const pendingRequest = await prisma.teamJoinRequest.findFirst({
        where: {
          teamId: id,
          userId: currentUser.id,
          status: 'pending',
        },
      });
      hasPendingJoinRequest = !!pendingRequest;
    }

    const response: TeamResponse = {
      id: team.id,
      name: team.name,
      description: team.description,
      iconImage: team.iconImage,
      visibility: team.visibility,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      owner: team.owner,
      memberCount: team.members.length,
      isUserMember: !!userMembership,
      userRole: userMembership?.role,
      hasPendingJoinRequest,
      members: team.members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: m.user,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/teams/[id]
 * Update team (owner/admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      throw new ForbiddenError('Only owner and admin can update team settings');
    }

    const body: UpdateTeamRequest = await request.json();

    // Prepare update data
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.iconImage !== undefined) updateData.iconImage = body.iconImage;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profileImage: true,
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
                nickname: true,
                region: true,
                pickleballExperience: true,
                gender: true,
                skillLevel: true,
                isProfileComplete: true,
              },
            },
          },
        },
      },
    });

    const response: TeamResponse = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      description: updatedTeam.description,
      iconImage: updatedTeam.iconImage,
      visibility: updatedTeam.visibility,
      createdAt: updatedTeam.createdAt.toISOString(),
      updatedAt: updatedTeam.updatedAt.toISOString(),
      owner: updatedTeam.owner,
      memberCount: updatedTeam.members.length,
      isUserMember: true,
      userRole: userMembership.role,
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/teams/[id]
 * Delete team (owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Only owner can delete team
    if (team.ownerId !== user.id) {
      throw new ForbiddenError('Only the owner can delete this team');
    }

    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
