import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError, NotFoundError } from '@/lib/errors';
import { SendMessageRequest, MessageResponse } from '@/lib/types';
import { notifyEventChatMessage } from '@/lib/notifications';

/**
 * POST /api/chat/messages
 * Send a message to a chat room
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body: SendMessageRequest = await request.json();

    if (!body.chatRoomId || !body.content) {
      throw new BadRequestError('chatRoomId and content are required');
    }

    // Check if chat room exists and get event info
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: body.chatRoomId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!chatRoom) {
      throw new NotFoundError('Chat room not found');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: body.content,
        userId: user.id,
        chatRoomId: body.chatRoomId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });

    // Send notification to event participants and creator
    if (chatRoom.event) {
      notifyEventChatMessage(
        chatRoom.event.id,
        user.nickname || user.name,
        chatRoom.event.title,
        body.content
      ).catch((error) => {
        console.error('Failed to send event chat message notification:', error);
      });
    }

    const response: MessageResponse = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
