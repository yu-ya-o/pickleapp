# PickleHub API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is returned from the Google Sign-In endpoint.

---

## Endpoints

### Authentication

#### POST `/api/auth/google`

Sign in with Google and get authentication token.

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "profileImage": "https://lh3.googleusercontent.com/a/..."
  },
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors:**
- `400` - Missing idToken
- `401` - Invalid Google token

---

### Events

#### GET `/api/events`

Get all events with optional filters.

**Query Parameters:**
- `status` (string, optional): Event status. Default: `"active"`
  - Values: `"active"`, `"cancelled"`, `"completed"`
- `upcoming` (boolean, optional): Filter upcoming events. Default: `true`
- `userId` (string, optional): Filter by creator ID

**Response:** `200 OK`
```json
[
  {
    "id": "event-uuid",
    "title": "Beginner Pickleball Meetup",
    "description": "Join us for a fun beginner-friendly session!",
    "location": "Central Park Courts",
    "startTime": "2024-01-20T18:00:00.000Z",
    "endTime": "2024-01-20T20:00:00.000Z",
    "maxParticipants": 8,
    "skillLevel": "beginner",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "creator": {
      "id": "user-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "profileImage": "https://..."
    },
    "reservations": [
      {
        "id": "reservation-uuid",
        "status": "confirmed",
        "createdAt": "2024-01-16T14:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "profileImage": "https://..."
        },
        "eventId": "event-uuid"
      }
    ],
    "availableSpots": 7,
    "isUserReserved": false
  }
]
```

**Example:**
```bash
curl "http://localhost:3001/api/events?status=active&upcoming=true"
```

---

#### GET `/api/events/:id`

Get a single event by ID.

**Response:** `200 OK`
```json
{
  "id": "event-uuid",
  "title": "Beginner Pickleball Meetup",
  // ... same structure as GET /api/events
}
```

**Errors:**
- `404` - Event not found

---

#### POST `/api/events`

Create a new event. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Advanced Players Meetup",
  "description": "Competitive play for advanced players",
  "location": "Downtown Sports Complex",
  "startTime": "2024-01-25T18:00:00.000Z",
  "endTime": "2024-01-25T20:00:00.000Z",
  "maxParticipants": 8,
  "skillLevel": "advanced"
}
```

**Validation:**
- All fields required
- `startTime` must be in the future
- `endTime` must be after `startTime`
- `skillLevel`: `"beginner"` | `"intermediate"` | `"advanced"` | `"all"`
- `maxParticipants`: integer >= 2

**Response:** `201 Created`
```json
{
  "id": "new-event-uuid",
  "title": "Advanced Players Meetup",
  // ... full event object
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

**Example:**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evening Pickleball",
    "description": "Casual evening play",
    "location": "Park Courts",
    "startTime": "2024-01-25T18:00:00Z",
    "endTime": "2024-01-25T20:00:00Z",
    "maxParticipants": 8,
    "skillLevel": "all"
  }'
```

---

#### PATCH `/api/events/:id`

Update an event. **Requires authentication. Creator only.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "location": "New Location",
  "startTime": "2024-01-25T19:00:00.000Z",
  "endTime": "2024-01-25T21:00:00.000Z",
  "maxParticipants": 10,
  "skillLevel": "intermediate",
  "status": "cancelled"
}
```

**Response:** `200 OK`
```json
{
  "id": "event-uuid",
  // ... updated event object
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not creator)
- `404` - Event not found

---

#### DELETE `/api/events/:id`

Delete an event. **Requires authentication. Creator only.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Event deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not creator)
- `404` - Event not found

---

### Reservations

#### GET `/api/reservations`

Get current user's reservations. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "reservation-uuid",
    "status": "confirmed",
    "createdAt": "2024-01-16T14:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://..."
    },
    "eventId": "event-uuid"
  }
]
```

**Errors:**
- `401` - Unauthorized

---

#### POST `/api/reservations`

Create a reservation for an event. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "eventId": "event-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "reservation-uuid",
  "status": "confirmed",
  "createdAt": "2024-01-16T14:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://..."
  },
  "eventId": "event-uuid"
}
```

**Validation:**
- Event must exist and be active
- Event must have available spots
- User cannot have existing confirmed reservation

**Errors:**
- `400` - Event full / Already reserved / Event not active
- `401` - Unauthorized
- `404` - Event not found

**Example:**
```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "event-uuid"}'
```

---

#### DELETE `/api/reservations/:id`

Cancel a reservation. **Requires authentication. Owner only.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Reservation cancelled successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not your reservation)
- `404` - Reservation not found

---

### Chat

#### GET `/api/chat/rooms/:eventId`

Get chat room and messages for an event. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "chatroom-uuid",
  "eventId": "event-uuid",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "messages": [
    {
      "id": "message-uuid",
      "content": "Hello everyone!",
      "createdAt": "2024-01-16T15:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "profileImage": "https://..."
      }
    }
  ]
}
```

**Notes:**
- Returns last 100 messages
- Automatically creates chat room if doesn't exist

**Errors:**
- `401` - Unauthorized
- `404` - Event not found

---

#### POST `/api/chat/messages`

Send a message to a chat room. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "chatRoomId": "chatroom-uuid",
  "content": "Hello everyone!"
}
```

**Response:** `201 Created`
```json
{
  "id": "message-uuid",
  "content": "Hello everyone!",
  "createdAt": "2024-01-16T15:30:00.000Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "profileImage": "https://..."
  }
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized
- `404` - Chat room not found

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3002');
```

### Protocol

All messages are JSON strings.

#### Client → Server Messages

**Join Room:**
```json
{
  "type": "join",
  "chatRoomId": "chatroom-uuid",
  "token": "user-token"
}
```

**Send Message:**
```json
{
  "type": "message",
  "content": "Hello!"
}
```
*Note: Must join room first*

**Leave Room:**
```json
{
  "type": "leave"
}
```

#### Server → Client Messages

**Joined Confirmation:**
```json
{
  "type": "joined",
  "data": {
    "chatRoomId": "chatroom-uuid",
    "userId": "user-uuid"
  }
}
```

**New Message:**
```json
{
  "type": "message",
  "data": {
    "id": "message-uuid",
    "content": "Hello!",
    "createdAt": "2024-01-16T15:30:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "profileImage": "https://..."
    }
  }
}
```

**User Joined:**
```json
{
  "type": "user_joined",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Jane Smith",
      "profileImage": "https://..."
    }
  }
}
```

**User Left:**
```json
{
  "type": "user_left",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Jane Smith",
      "profileImage": "https://..."
    }
  }
}
```

**Error:**
```json
{
  "type": "error",
  "error": "Error message"
}
```

### Example Usage

```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onopen = () => {
  // Join chat room
  ws.send(JSON.stringify({
    type: 'join',
    chatRoomId: 'chatroom-uuid',
    token: 'user-token'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'joined':
      console.log('Joined room:', message.data.chatRoomId);
      break;
    case 'message':
      console.log('New message:', message.data);
      break;
    case 'user_joined':
      console.log('User joined:', message.data.user.name);
      break;
  }
};

// Send message
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: 'message',
    content: content
  }));
}

// Clean up
ws.onclose = () => {
  console.log('Disconnected');
};
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "ErrorName",
  "message": "Human readable error message",
  "statusCode": 400
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## CORS

CORS is enabled for all origins in development. For production:
- Restrict to specific origins
- Enable credentials
- Set appropriate headers

---

## Data Types

### Date Format
All dates are in ISO 8601 format:
```
2024-01-20T18:00:00.000Z
```

### UUID Format
All IDs are UUIDs:
```
550e8400-e29b-41d4-a716-446655440000
```

---

## Testing with curl

### Sign In
```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-google-id-token"}'
```

### Get Events
```bash
curl http://localhost:3001/api/events
```

### Create Event
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test",
    "location": "Test Location",
    "startTime": "2024-01-25T18:00:00Z",
    "endTime": "2024-01-25T20:00:00Z",
    "maxParticipants": 8,
    "skillLevel": "beginner"
  }'
```

### Make Reservation
```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "event-uuid"}'
```

---

## WebSocket Testing with wscat

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c ws://localhost:3002

# Join room
{"type":"join","chatRoomId":"chatroom-uuid","token":"user-token"}

# Send message
{"type":"message","content":"Hello!"}

# Leave
{"type":"leave"}
```

---

**Version:** 1.0.0
**Last Updated:** 2024-01-15
