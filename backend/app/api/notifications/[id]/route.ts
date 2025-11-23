import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '@/lib/errors';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const action = request.nextUrl.searchParams.get('action');

    if (action === 'read') {
      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Mark as read
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return NextResponse.json({
        message: 'Notification marked as read',
      });
    }

    throw new BadRequestError('Invalid action');
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify notification belongs to user and delete
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Notification deleted',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
