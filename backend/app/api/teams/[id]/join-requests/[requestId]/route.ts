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
import { ApproveJoinRequestRequest } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
    requestId: string;
  }>;
}

/**
 * PATCH /api/teams/[id]/join-requests/[requestId]
 * Approve or reject join request (owner/admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, requestId } = await params;
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
      throw new ForbiddenError('Only owner and admin can approve join requests');
    }

    const joinRequest = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
      },
    });

    if (!joinRequest) {
      throw new NotFoundError('Join request not found');
    }

    if (joinRequest.teamId !== id) {
      throw new BadRequestError('Join request does not belong to this team');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestError('Join request has already been processed');
    }

    const body: ApproveJoinRequestRequest = await request.json();

    console.log(`📝 PATCH /api/teams/${id}/join-requests/${requestId}`);
    console.log(`   User: ${user.email}, Role: ${userMembership.role}`);
    console.log(`   Request status: ${joinRequest.status}`);
    console.log(`   Action received: ${body.action}`);

    if (!['approve', 'reject'].includes(body.action)) {
      throw new BadRequestError('Invalid action');
    }

    if (body.action === 'approve') {
      console.log(`   ✅ Approving request for user: ${joinRequest.user.email}`);
      // Add user as member
      await prisma.teamMember.create({
        data: {
          teamId: id,
          userId: joinRequest.userId,
          role: 'member',
        },
      });

      // Update request status
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: 'approved' },
      });

      return NextResponse.json({
        message: 'Join request approved',
        status: 'approved',
      });
    } else {
      console.log(`   ❌ Rejecting request for user: ${joinRequest.user.email}`);
      // Reject request
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return NextResponse.json({
        message: 'Join request rejected',
        status: 'rejected',
      });
    }
  } catch (error) {
    return errorResponse(error);
  }
}
