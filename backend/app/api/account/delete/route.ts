import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/account/delete
 * Delete user account with specific data handling:
 * - Delete all user-created events
 * - Transfer team ownership or remove from teams
 * - Cancel future reservations
 * - Update messages to show "削除済みユーザー"
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

      // 5. Handle team ownership transfer
      // Find all teams owned by the user
      const ownedTeams = await tx.team.findMany({
        where: { ownerId: userId },
        include: {
          members: {
            where: {
              userId: { not: userId },
              role: { in: ['admin', 'member'] },
            },
            orderBy: [
              { role: 'asc' }, // admins first
              { joinedAt: 'asc' }, // then by join date
            ],
          },
        },
      });

      for (const team of ownedTeams) {
        if (team.members.length > 0) {
          // Transfer ownership to the first admin, or first member if no admins
          const newOwner = team.members[0];

          // Update team owner
          await tx.team.update({
            where: { id: team.id },
            data: { ownerId: newOwner.userId },
          });

          // Update the new owner's team member role to owner
          await tx.teamMember.update({
            where: { id: newOwner.id },
            data: { role: 'owner' },
          });
        } else {
          // No other members, delete the team
          await tx.team.delete({
            where: { id: team.id },
          });
        }
      }

      // 6. Remove user from all team memberships
      await tx.teamMember.deleteMany({
        where: { userId: userId },
      });

      // 7. Delete join requests
      await tx.teamJoinRequest.deleteMany({
        where: { userId: userId },
      });

      // 8. Delete notifications
      await tx.notification.deleteMany({
        where: { userId: userId },
      });

      // 9. Update user record to mark as deleted
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
