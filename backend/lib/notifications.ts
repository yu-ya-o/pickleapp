import { prisma } from './prisma';
import { sendPushNotification, sendPushNotifications } from './pushNotifications';

export enum NotificationType {
  EVENT_JOINED = 'event_joined',
  EVENT_CANCELLED = 'event_cancelled',
  TEAM_JOIN_REQUEST = 'team_join_request',
  TEAM_MEMBER_LEFT = 'team_member_left',
  TEAM_JOIN_APPROVED = 'team_join_approved',
  TEAM_JOIN_REJECTED = 'team_join_rejected',
  EVENT_CHAT_MESSAGE = 'event_chat_message',
  TEAM_CHAT_MESSAGE = 'team_chat_message',
  EVENT_UPDATED = 'event_updated',
  EVENT_CANCELLED_BY_CREATOR = 'event_cancelled_by_creator',
  EVENT_REMINDER = 'event_reminder',
  TEAM_ROLE_CHANGED = 'team_role_changed',
  TEAM_EVENT_CREATED = 'team_event_created',
}

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
}

// Create a single notification
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
      },
    });

    // Send push notification
    sendPushNotification(params.userId, {
      title: params.title,
      body: params.message,
      type: params.type,
      relatedId: params.relatedId,
    }).catch((error) => {
      console.error('Failed to send push notification:', error);
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Create multiple notifications (for bulk operations)
export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
) {
  try {
    await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        relatedId: n.relatedId,
      })),
    });

    // Send push notifications to all users
    // Group by same title/message to send in batches
    const userIds = notifications.map((n) => n.userId);
    if (notifications.length > 0) {
      const firstNotification = notifications[0];
      sendPushNotifications(userIds, {
        title: firstNotification.title,
        body: firstNotification.message,
        type: firstNotification.type,
        relatedId: firstNotification.relatedId,
      }).catch((error) => {
        console.error('Failed to send bulk push notifications:', error);
      });
    }
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

// 1. Event joined notification
export async function notifyEventJoined(
  eventId: string,
  participantName: string,
  eventTitle: string
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true },
  });

  if (!event) return;

  await createNotification({
    userId: event.creatorId,
    type: NotificationType.EVENT_JOINED,
    title: '新しい参加者',
    message: `${participantName}さんが「${eventTitle}」に参加しました`,
    relatedId: eventId,
  });
}

// 2. Event participation cancelled notification
export async function notifyEventCancelled(
  eventId: string,
  participantName: string,
  eventTitle: string
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true },
  });

  if (!event) return;

  await createNotification({
    userId: event.creatorId,
    type: NotificationType.EVENT_CANCELLED,
    title: '参加キャンセル',
    message: `${participantName}さんが「${eventTitle}」への参加をキャンセルしました`,
    relatedId: eventId,
  });
}

// 3. Team join request notification
export async function notifyTeamJoinRequest(
  teamId: string,
  requesterName: string,
  teamName: string
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: {
          OR: [{ role: 'owner' }, { role: 'admin' }],
        },
        select: { userId: true },
      },
    },
  });

  if (!team) return;

  // Notify all admins and owner
  const notifications = team.members.map((member) => ({
    userId: member.userId,
    type: NotificationType.TEAM_JOIN_REQUEST,
    title: '新しい参加申請',
    message: `${requesterName}さんが「${teamName}」への参加を希望しています`,
    relatedId: teamId,
  }));

  await createBulkNotifications(notifications);
}

// 4. Team member left notification
export async function notifyTeamMemberLeft(
  teamId: string,
  memberName: string,
  teamName: string
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { ownerId: true },
  });

  if (!team) return;

  await createNotification({
    userId: team.ownerId,
    type: NotificationType.TEAM_MEMBER_LEFT,
    title: 'メンバー離脱',
    message: `${memberName}さんが「${teamName}」から離脱しました`,
    relatedId: teamId,
  });
}

// 5. Team join approved/rejected notification
export async function notifyTeamJoinResponse(
  userId: string,
  teamName: string,
  approved: boolean,
  teamId: string
) {
  await createNotification({
    userId,
    type: approved
      ? NotificationType.TEAM_JOIN_APPROVED
      : NotificationType.TEAM_JOIN_REJECTED,
    title: approved ? '参加申請が承認されました' : '参加申請が拒否されました',
    message: approved
      ? `「${teamName}」への参加が承認されました`
      : `「${teamName}」への参加申請が拒否されました`,
    relatedId: teamId,
  });
}

// 6-7. Event chat message notification (supports both Event and TeamEvent)
export async function notifyEventChatMessage(
  eventId: string,
  senderId: string,
  senderName: string,
  eventTitle: string,
  messagePreview: string
) {
  // Try regular event first
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: { select: { id: true } },
      reservations: {
        where: { status: 'confirmed' },
        select: { userId: true },
      },
    },
  });

  const userIds = new Set<string>();

  if (event) {
    // Regular event: notify creator and participants
    userIds.add(event.creator.id);
    event.reservations.forEach((r) => userIds.add(r.userId));
  } else {
    // Try team event
    const teamEvent = await prisma.teamEvent.findUnique({
      where: { id: eventId },
      include: {
        creator: { select: { id: true } },
        participants: {
          where: { status: 'confirmed' },
          select: { userId: true },
        },
      },
    });

    if (!teamEvent) return;

    // Team event: notify creator and participants
    userIds.add(teamEvent.creator.id);
    teamEvent.participants.forEach((p) => userIds.add(p.userId));
  }

  // Remove sender from notification list
  userIds.delete(senderId);

  if (userIds.size === 0) return;

  const notifications = Array.from(userIds).map((userId) => ({
    userId,
    type: NotificationType.EVENT_CHAT_MESSAGE,
    title: 'イベントチャット',
    message: `${senderName}: ${messagePreview.substring(0, 50)}...`,
    relatedId: eventId,
  }));

  await createBulkNotifications(notifications);
}

// 8. Team chat message notification
export async function notifyTeamChatMessage(
  teamId: string,
  senderId: string,
  senderName: string,
  teamName: string,
  messagePreview: string
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { select: { userId: true } },
    },
  });

  if (!team) return;

  // Exclude sender from notifications
  const notifications = team.members
    .filter((member) => member.userId !== senderId)
    .map((member) => ({
      userId: member.userId,
      type: NotificationType.TEAM_CHAT_MESSAGE,
      title: 'チームチャット',
      message: `${senderName}: ${messagePreview.substring(0, 50)}...`,
      relatedId: teamId,
    }));

  await createBulkNotifications(notifications);
}

// 9. Event updated notification
export async function notifyEventUpdated(
  eventId: string,
  eventTitle: string,
  changedFields: string[]
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      reservations: {
        where: { status: 'confirmed' },
        select: { userId: true },
      },
    },
  });

  if (!event) return;

  const notifications = event.reservations.map((r) => ({
    userId: r.userId,
    type: NotificationType.EVENT_UPDATED,
    title: 'イベント情報が更新されました',
    message: `「${eventTitle}」の${changedFields.join('、')}が変更されました`,
    relatedId: eventId,
  }));

  await createBulkNotifications(notifications);
}

// 10. Event cancelled by creator notification
export async function notifyEventCancelledByCreator(
  eventId: string,
  eventTitle: string
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      reservations: {
        where: { status: 'confirmed' },
        select: { userId: true },
      },
    },
  });

  if (!event) return;

  const notifications = event.reservations.map((r) => ({
    userId: r.userId,
    type: NotificationType.EVENT_CANCELLED_BY_CREATOR,
    title: 'イベントがキャンセルされました',
    message: `「${eventTitle}」がキャンセルされました`,
    relatedId: eventId,
  }));

  await createBulkNotifications(notifications);
}

// 11. Event reminder notification
export async function notifyEventReminder(
  eventId: string,
  eventTitle: string,
  hoursUntilEvent: number
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: { select: { id: true } },
      reservations: {
        where: { status: 'confirmed' },
        select: { userId: true },
      },
    },
  });

  if (!event) return;

  const userIds = new Set<string>();
  userIds.add(event.creator.id);
  event.reservations.forEach((r) => userIds.add(r.userId));

  const timeText = hoursUntilEvent === 1 ? '1時間後' : `${hoursUntilEvent}時間後`;

  const notifications = Array.from(userIds).map((userId) => ({
    userId,
    type: NotificationType.EVENT_REMINDER,
    title: 'イベントリマインダー',
    message: `「${eventTitle}」が${timeText}に開始されます`,
    relatedId: eventId,
  }));

  await createBulkNotifications(notifications);
}

// 12. Team role changed notification
export async function notifyTeamRoleChanged(
  userId: string,
  teamName: string,
  newRole: string,
  teamId: string
) {
  const roleText = newRole === 'admin' ? '管理者' : newRole === 'owner' ? 'オーナー' : 'メンバー';

  await createNotification({
    userId,
    type: NotificationType.TEAM_ROLE_CHANGED,
    title: '役割が変更されました',
    message: `「${teamName}」での役割が${roleText}に変更されました`,
    relatedId: teamId,
  });
}

// 13. Team event created notification
export async function notifyTeamEventCreated(
  teamId: string,
  eventTitle: string,
  eventId: string
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { select: { userId: true } },
    },
  });

  if (!team) return;

  const notifications = team.members.map((member) => ({
    userId: member.userId,
    type: NotificationType.TEAM_EVENT_CREATED,
    title: '新しいチームイベント',
    message: `「${eventTitle}」が作成されました`,
    relatedId: `${teamId}:${eventId}`, // Format: "teamId:eventId" for team events
  }));

  await createBulkNotifications(notifications);
}
