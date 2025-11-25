import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/account/delete
 * Delete user account with specific data handling:
 * - Delete all user-created events
 * - Remove from teams (ownership not transferred)
 * - Cancel future reservations
 * - Update messages to show "削除済みユーザー"
 * - Prevent deletion if user is the only owner/admin in any team
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if user is owner or admin in any team without other owners/admins
    const userTeamMemberships = await prisma.teamMember.findMany({
      where: {
        userId: userId,
        role: { in: ['owner', 'admin'] },
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId: { not: userId },
                role: { in: ['owner', 'admin'] },
              },
            },
          },
        },
      },
    });

    // Check if any team would be left without an owner or admin
    const teamsWithoutLeadership = userTeamMemberships.filter(
      (membership) => membership.team.members.length === 0
    );

    if (teamsWithoutLeadership.length > 0) {
      const teamNames = teamsWithoutLeadership
        .map((m) => m.team.name)
        .join(', ');
      return NextResponse.json(
        {
          error: `以下のチームでオーナーまたはアドミンが他にいないため、アカウントを削除できません: ${teamNames}`,
        },
        { status: 400 }
      );
    }

    // Start a transaction to ensure all operations complete or none do
    await prisma.$transaction(async (tx) => {
      // 1. Delete all events created by the user
      // This will cascade delete related reservations, chat rooms, and messages
      await tx.event.deleteMany({
        where: { creatorId: userId },
      });

      // 2. Delete all team events created by the user
      await tx.teamEvent.deleteMany({
        where: { createdBy: userId },
      });

      // 3. Cancel all future event reservations
      const now = new Date();
      await tx.reservation.deleteMany({
        where: {
          userId: userId,
          event: {
            startTime: {
              gt: now,
            },
          },
        },
      });

      // 4. Cancel all future team event participations
      await tx.teamEventParticipant.deleteMany({
        where: {
          userId: userId,
          event: {
            startTime: {
              gt: now,
            },
          },
        },
      });

      // 5. Remove user from all team memberships
      // Teams will remain but user will be removed from membership
      // Team ownership is not transferred
      await tx.teamMember.deleteMany({
        where: { userId: userId },
      });

      // 6. Delete join requests
      await tx.teamJoinRequest.deleteMany({
        where: { userId: userId },
      });

      // 7. Delete notifications
      await tx.notification.deleteMany({
        where: { userId: userId },
      });

      // 8. Update user record to mark as deleted
      // Keep messages but change user name to "削除済みユーザー"
      await tx.user.update({
        where: { id: userId },
        data: {
          name: '削除済みユーザー',
          email: `deleted-${userId}@deleted.com`, // Change email to avoid conflicts
          nickname: null,
          bio: null,
          profileImage: null,
          region: null,
          pickleballExperience: null,
          gender: null,
          skillLevel: null,
          googleId: null,
          appleId: null,
          instagramUrl: null,
          twitterUrl: null,
          tiktokUrl: null,
          lineUrl: null,
          duprDoubles: null,
          duprSingles: null,
          myPaddle: null,
          isProfileComplete: false,
        },
      });
    });

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return errorResponse(error);
  }
}
