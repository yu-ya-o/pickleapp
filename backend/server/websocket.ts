import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Client {
  ws: WebSocket;
  userId: string;
  chatRoomId: string;
}

interface WSIncomingMessage {
  type: 'join' | 'message' | 'leave';
  chatRoomId?: string;
  userId?: string;
  token?: string;
  content?: string;
}

interface WSOutgoingMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'error' | 'joined';
  data?: any;
  error?: string;
}

const clients = new Map<string, Client>();
const rooms = new Map<string, Set<string>>();

/**
 * Verify user token and return userId
 * In production, this would verify JWT token
 */
async function verifyToken(token: string): Promise<string | null> {
  try {
    // For simplicity, token is userId
    const user = await prisma.user.findUnique({
      where: { id: token },
    });
    return user ? user.id : null;
  } catch (error) {
    return null;
  }
}

/**
 * Send message to all clients in a chat room
 */
function broadcastToRoom(chatRoomId: string, message: WSOutgoingMessage, excludeClientId?: string) {
  const room = rooms.get(chatRoomId);
  if (!room) return;

  room.forEach((clientId) => {
    if (clientId === excludeClientId) return;

    const client = clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(clientId: string, data: string) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    const message: WSIncomingMessage = JSON.parse(data);

    switch (message.type) {
      case 'join':
        if (!message.chatRoomId || !message.token) {
          client.ws.send(JSON.stringify({
            type: 'error',
            error: 'chatRoomId and token are required',
          } as WSOutgoingMessage));
          return;
        }

        // Verify token
        const userId = await verifyToken(message.token);
        if (!userId) {
          client.ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid token',
          } as WSOutgoingMessage));
          return;
        }

        // Update client info
        client.userId = userId;
        client.chatRoomId = message.chatRoomId;

        // Add to room
        if (!rooms.has(message.chatRoomId)) {
          rooms.set(message.chatRoomId, new Set());
        }
        rooms.get(message.chatRoomId)!.add(clientId);

        // Get user info
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, profileImage: true },
        });

        // Notify client they joined
        client.ws.send(JSON.stringify({
          type: 'joined',
          data: { chatRoomId: message.chatRoomId, userId },
        } as WSOutgoingMessage));

        // Notify others in room
        broadcastToRoom(message.chatRoomId, {
          type: 'user_joined',
          data: { user },
        }, clientId);

        console.log(`User ${userId} joined room ${message.chatRoomId}`);
        break;

      case 'message':
        if (!message.content) {
          client.ws.send(JSON.stringify({
            type: 'error',
            error: 'content is required',
          } as WSOutgoingMessage));
          return;
        }

        if (!client.chatRoomId || !client.userId) {
          client.ws.send(JSON.stringify({
            type: 'error',
            error: 'Must join a room first',
          } as WSOutgoingMessage));
          return;
        }

        // Save message to database
        const savedMessage = await prisma.message.create({
          data: {
            content: message.content,
            userId: client.userId,
            chatRoomId: client.chatRoomId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        });

        // Broadcast to all in room (including sender)
        const messageData = {
          id: savedMessage.id,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt.toISOString(),
          user: savedMessage.user,
        };

        broadcastToRoom(client.chatRoomId, {
          type: 'message',
          data: messageData,
        });

        console.log(`Message sent in room ${client.chatRoomId}`);
        break;

      case 'leave':
        if (client.chatRoomId) {
          const room = rooms.get(client.chatRoomId);
          if (room) {
            room.delete(clientId);
            if (room.size === 0) {
              rooms.delete(client.chatRoomId);
            }
          }

          // Notify others
          const leavingUser = await prisma.user.findUnique({
            where: { id: client.userId },
            select: { id: true, name: true, profileImage: true },
          });

          broadcastToRoom(client.chatRoomId, {
            type: 'user_left',
            data: { user: leavingUser },
          }, clientId);

          console.log(`User ${client.userId} left room ${client.chatRoomId}`);
        }
        break;

      default:
        client.ws.send(JSON.stringify({
          type: 'error',
          error: 'Unknown message type',
        } as WSOutgoingMessage));
    }
  } catch (error) {
    console.error('Error handling message:', error);
    client.ws.send(JSON.stringify({
      type: 'error',
      error: 'Invalid message format',
    } as WSOutgoingMessage));
  }
}

/**
 * Handle client disconnect
 */
function handleDisconnect(clientId: string) {
  const client = clients.get(clientId);
  if (!client) return;

  // Remove from room
  if (client.chatRoomId) {
    const room = rooms.get(client.chatRoomId);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        rooms.delete(client.chatRoomId);
      }
    }

    // Notify others
    prisma.user.findUnique({
      where: { id: client.userId },
      select: { id: true, name: true, profileImage: true },
    }).then((user) => {
      if (user && client.chatRoomId) {
        broadcastToRoom(client.chatRoomId, {
          type: 'user_left',
          data: { user },
        }, clientId);
      }
    });
  }

  clients.delete(clientId);
  console.log(`Client ${clientId} disconnected`);
}

/**
 * Start WebSocket server
 */
export function startWebSocketServer(port: number = 3002) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientId = `${Date.now()}-${Math.random()}`;

    clients.set(clientId, {
      ws,
      userId: '',
      chatRoomId: '',
    });

    console.log(`Client ${clientId} connected`);

    ws.on('message', (data: Buffer) => {
      handleMessage(clientId, data.toString());
    });

    ws.on('close', () => {
      handleDisconnect(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      handleDisconnect(clientId);
    });
  });

  console.log(`WebSocket server started on port ${port}`);

  return wss;
}

// Start server if run directly
if (require.main === module) {
  const port = parseInt(process.env.WEBSOCKET_PORT || '3002');
  startWebSocketServer(port);
}
