import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { updateFcmToken } from '@/lib/pushNotifications';

/**
 * POST /api/device-token
 * Register or update FCM device token for push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body = await request.json();
    const { fcmToken } = body;

    if (typeof fcmToken !== 'string') {
      throw new BadRequestError('fcmToken must be a string');
    }

    await updateFcmToken(user.id, fcmToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/device-token
 * Remove FCM device token (for logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    await updateFcmToken(user.id, null);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
