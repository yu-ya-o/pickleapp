import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, NotFoundError } from '@/lib/errors';
import { ChatRoomResponse, MessageResponse } from '@/lib/types';

interface RouteParams {
  params: {
    eventId: string;
  };
}

/**
 * GET /api/chat/rooms/[eventId]
 * Get chat room and messages for an event
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Get or create chat room
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { eventId: params.eventId },
      include: {
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 100, // Last 100 messages
        },
      },
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          eventId: params.eventId,
        },
        include: {
          messages: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });
    }

    const messages: MessageResponse[] = chatRoom.messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    }));

    const response: ChatRoomResponse = {
      id: chatRoom.id,
      eventId: chatRoom.eventId,
      createdAt: chatRoom.createdAt.toISOString(),
      messages,
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
