import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, NotFoundError } from '@/lib/errors';
import { ChatRoomResponse, MessageResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    eventId: string;
  }>;
}

/**
 * GET /api/chat/rooms/[eventId]
 * Get chat room and messages for an event (supports both Event and TeamEvent)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Check if regular event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    // If not found, check if team event exists
    const teamEvent = !event
      ? await prisma.teamEvent.findUnique({
          where: { id: eventId },
        })
      : null;

    if (!event && !teamEvent) {
      throw new NotFoundError('Event not found');
    }

    const isTeamEvent = !!teamEvent;

    // Get or create chat room
    let chatRoom = await prisma.chatRoom.findFirst({
      where: isTeamEvent ? { teamEventId: eventId } : { eventId },
      include: {
        messages: {
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
          orderBy: {
            createdAt: 'asc',
          },
          take: 100, // Last 100 messages
        },
      },
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: isTeamEvent ? { teamEventId: eventId } : { eventId },
        include: {
          messages: {
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
          },
        },
      });
    }

    const messages: MessageResponse[] = chatRoom.messages.map(
      (m: (typeof chatRoom.messages)[number]) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        user: m.user,
      })
    );

    const response: ChatRoomResponse = {
      id: chatRoom.id,
      eventId: chatRoom.eventId || chatRoom.teamEventId || eventId,
      createdAt: chatRoom.createdAt.toISOString(),
      messages,
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
