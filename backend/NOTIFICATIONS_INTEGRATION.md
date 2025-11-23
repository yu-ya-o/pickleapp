# Notifications Integration Guide

This document explains how to integrate notifications into existing API endpoints.

## Import the notification functions

Add this import to any file where you need to create notifications:

```typescript
import {
  notifyEventJoined,
  notifyEventCancelled,
  notifyTeamJoinRequest,
  // ... other notification functions
} from '@/lib/notifications';
```

## Integration Points

### 1. Event Participation (app/api/reservations/route.ts)

**POST /api/reservations** - When user joins an event:
```typescript
// After creating the reservation
const user = await prisma.user.findUnique({ where: { id: userId } });
await notifyEventJoined(eventId, user.name, event.title);
```

### 2. Event Cancellation (app/api/reservations/[id]/route.ts)

**DELETE /api/reservations/[id]** - When user cancels participation:
```typescript
// After deleting the reservation
const user = await prisma.user.findUnique({ where: { id: userId } });
await notifyEventCancelled(eventId, user.name, event.title);
```

### 3. Team Join Requests (app/api/teams/[id]/join-requests/route.ts)

**POST /api/teams/[id]/join-requests** - When user requests to join:
```typescript
// After creating the join request
const user = await prisma.user.findUnique({ where: { id: userId } });
await notifyTeamJoinRequest(teamId, user.name, team.name);
```

**PATCH /api/teams/[id]/join-requests/[requestId]** - When request is approved/rejected:
```typescript
// After updating the request status
await notifyTeamJoinResponse(
  request.userId,
  team.name,
  status === 'approved',
  teamId
);
```

### 4. Team Member Leaving (app/api/teams/[id]/members/[userId]/route.ts)

**DELETE /api/teams/[id]/members/[userId]** - When member leaves:
```typescript
// After removing the member
const user = await prisma.user.findUnique({ where: { id: userId } });
await notifyTeamMemberLeft(teamId, user.name, team.name);
```

### 5. Event Chat Messages (app/api/chat/rooms/[eventId]/route.ts)

**POST /api/chat/rooms/[eventId]** - When message is sent:
```typescript
// After creating the message
const sender = await prisma.user.findUnique({ where: { id: userId } });
const event = await prisma.event.findUnique({ where: { id: eventId } });
await notifyEventChatMessage(
  eventId,
  sender.name,
  event.title,
  message.content
);
```

### 6. Team Chat Messages (app/api/teams/[id]/chat/route.ts)

**POST /api/teams/[id]/chat** - When message is sent:
```typescript
// After creating the message
const sender = await prisma.user.findUnique({ where: { id: userId } });
const team = await prisma.team.findUnique({ where: { id: teamId } });
await notifyTeamChatMessage(
  teamId,
  sender.name,
  team.name,
  message.content
);
```

### 7. Event Updates (app/api/events/[id]/route.ts)

**PATCH /api/events/[id]** - When event is updated:
```typescript
// After updating the event
const changedFields = [];
if (body.title !== event.title) changedFields.push('タイトル');
if (body.location !== event.location) changedFields.push('場所');
if (body.startTime !== event.startTime) changedFields.push('開始時間');

if (changedFields.length > 0) {
  await notifyEventUpdated(eventId, event.title, changedFields);
}
```

### 8. Event Cancellation (app/api/events/[id]/route.ts)

**DELETE /api/events/[id]** - When event is cancelled:
```typescript
// Before deleting the event
const event = await prisma.event.findUnique({ where: { id: eventId } });
await notifyEventCancelledByCreator(eventId, event.title);
```

### 9. Team Role Changes (app/api/teams/[id]/members/[userId]/route.ts)

**PATCH /api/teams/[id]/members/[userId]** - When member role changes:
```typescript
// After updating the role
const team = await prisma.team.findUnique({ where: { id: teamId } });
await notifyTeamRoleChanged(userId, team.name, newRole, teamId);
```

### 10. Team Event Creation (app/api/teams/[id]/events/route.ts)

**POST /api/teams/[id]/events** - When team event is created:
```typescript
// After creating the team event
await notifyTeamEventCreated(teamId, event.title, event.id);
```

### 11. Event Reminders (Scheduled Job)

Create a cron job or scheduled task to send event reminders:

```typescript
// Example: Run every hour
export async function sendEventReminders() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Find events starting in the next hour
  const upcomingEvents = await prisma.event.findMany({
    where: {
      startTime: {
        gte: now,
        lte: oneHourLater,
      },
      status: 'active',
    },
  });

  for (const event of upcomingEvents) {
    await notifyEventReminder(event.id, event.title, 1);
  }
}
```

## After Integration

After integrating notifications, remember to:

1. **Run Prisma migration**:
   ```bash
   cd backend
   npx prisma migrate dev --name add_notifications
   npx prisma generate
   ```

2. **Test the API endpoints**:
   - GET /api/notifications
   - PATCH /api/notifications/read-all
   - PATCH /api/notifications/[id]?action=read
   - DELETE /api/notifications/[id]

3. **Deploy the changes**:
   - Commit and push the changes
   - Deploy to your hosting platform
   - Run migrations on production

## Notes

- Notifications are created asynchronously and shouldn't block the main API response
- Consider using a background job queue for notification creation in high-traffic scenarios
- Monitor notification creation to ensure it doesn't impact API performance
- Add error handling to prevent notification failures from breaking main functionality
