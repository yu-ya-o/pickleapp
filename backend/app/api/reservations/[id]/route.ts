import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';
import { notifyEventCancelled } from '@/lib/notifications';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DELETE /api/reservations/[id]
 * Cancel a reservation
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    // Only the user who made the reservation can cancel it
    if (reservation.userId !== user.id) {
      throw new ForbiddenError('You can only cancel your own reservations');
    }

    // Update status to cancelled instead of deleting
    await prisma.reservation.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // Send notification to event creator
    if (reservation.event) {
      notifyEventCancelled(
        reservation.event.id,
        user.nickname || user.name,
        reservation.event.title
      ).catch((error) => {
        console.error('Failed to send event cancelled notification:', error);
      });
    }

    return NextResponse.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
