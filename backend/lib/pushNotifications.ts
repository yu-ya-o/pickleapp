import * as admin from 'firebase-admin';
import { prisma } from './prisma';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set. Push notifications disabled.');
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

// Initialize on module load
initializeFirebase();

interface PushNotificationData {
  title: string;
  body: string;
  type: string;
  relatedId?: string;
}

/**
 * Send push notification to a single user
 */
export async function sendPushNotification(
  userId: string,
  data: PushNotificationData
): Promise<boolean> {
  if (!firebaseInitialized) {
    return false;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      return false;
    }

    const message: admin.messaging.Message = {
      token: user.fcmToken,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        type: data.type,
        relatedId: data.relatedId || '',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
            'content-available': 1,
          },
        },
      },
    };

    await admin.messaging().send(message);
    return true;
  } catch (error: unknown) {
    // Handle invalid token error by clearing the token
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      if (
        firebaseError.code === 'messaging/invalid-registration-token' ||
        firebaseError.code === 'messaging/registration-token-not-registered'
      ) {
        // Token is invalid, clear it from the database
        await prisma.user.update({
          where: { id: userId },
          data: { fcmToken: null },
        });
        console.log(`Cleared invalid FCM token for user ${userId}`);
      }
    }
    console.error(`Failed to send push notification to user ${userId}:`, error);
    return false;
  }
}

/**
 * Send push notifications to multiple users
 */
export async function sendPushNotifications(
  userIds: string[],
  data: PushNotificationData
): Promise<void> {
  if (!firebaseInitialized || userIds.length === 0) {
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        fcmToken: { not: null },
      },
      select: { id: true, fcmToken: true },
    });

    if (users.length === 0) {
      return;
    }

    const tokens = users.map((u) => u.fcmToken!);

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        type: data.type,
        relatedId: data.relatedId || '',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
            'content-available': 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      // Clear invalid tokens
      if (failedTokens.length > 0) {
        await prisma.user.updateMany({
          where: { fcmToken: { in: failedTokens } },
          data: { fcmToken: null },
        });
        console.log(`Cleared ${failedTokens.length} invalid FCM tokens`);
      }
    }

    console.log(
      `Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`
    );
  } catch (error) {
    console.error('Failed to send push notifications:', error);
  }
}

/**
 * Update user's FCM token
 */
export async function updateFcmToken(
  userId: string,
  fcmToken: string | null
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { fcmToken },
  });
}
