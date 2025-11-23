import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/lib/errors';
import { TeamChatRoomResponse, SendTeamMessageRequest, TeamMessageResponse } from '@/lib/types';
import { notifyTeamChatMessage } from '@/lib/notifications';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/teams/[id]/chat
 * Get team chat room and messages
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if user is a member
    const isMember = team.members.some((m) => m.userId === user.id);
    if (!isMember) {
      throw new ForbiddenError('Only team members can access team chat');
    }

    // Get or create chat room
    let chatRoom = await prisma.teamChatRoom.findUnique({
      where: { teamId: id },
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
      chatRoom = await prisma.teamChatRoom.create({
        data: {
          teamId: id,
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

    const response: TeamChatRoomResponse = {
      id: chatRoom.id,
      teamId: chatRoom.teamId,
      createdAt: chatRoom.createdAt.toISOString(),
      messages: chatRoom.messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        user: m.user,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/teams/[id]/chat
 * Send message to team chat
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if user is a member
    const isMember = team.members.some((m) => m.userId === user.id);
    if (!isMember) {
      throw new ForbiddenError('Only team members can send messages');
    }

    const body: SendTeamMessageRequest = await request.json();

    if (!body.content) {
      throw new BadRequestError('Message content is required');
    }

    // Get or create chat room
    let chatRoom = await prisma.teamChatRoom.findUnique({
      where: { teamId: id },
    });

    if (!chatRoom) {
      chatRoom = await prisma.teamChatRoom.create({
        data: {
          teamId: id,
        },
      });
    }

    const message = await prisma.teamMessage.create({
      data: {
        content: body.content,
        userId: user.id,
        chatRoomId: chatRoom.id,
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

    // Send notification to all team members
    notifyTeamChatMessage(id, user.name, team.name, body.content).catch(
      (error) => {
        console.error('Failed to send team chat message notification:', error);
      }
    );

    const response: TeamMessageResponse = {
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
