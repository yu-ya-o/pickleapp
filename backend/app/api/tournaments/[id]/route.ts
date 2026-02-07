import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import {
  errorResponse,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/lib/errors';
import { UpdateTournamentRequest, TournamentResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/tournaments/[id]
 * Get a single tournament by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    const response: TournamentResponse = {
      id: tournament.id,
      title: tournament.title,
      description: tournament.description,
      eventDate: tournament.eventDate,
      organizer: tournament.organizer,
      venue: tournament.venue,
      address: tournament.address,
      latitude: tournament.latitude,
      longitude: tournament.longitude,
      events: tournament.events,
      matchFormat: tournament.matchFormat,
      applicationDeadline: tournament.applicationDeadline,
      entryFee: tournament.entryFee,
      paymentMethod: tournament.paymentMethod,
      tournamentUrl: tournament.tournamentUrl,
      contactInfo: tournament.contactInfo,
      snsUrls: tournament.snsUrls as TournamentResponse['snsUrls'],
      status: tournament.status,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
      creator: tournament.creator,
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/tournaments/[id]
 * Update a tournament
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    if (tournament.creatorId !== user.id) {
      throw new ForbiddenError('Only the creator can update this tournament');
    }

    const body: UpdateTournamentRequest = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.eventDate !== undefined) updateData.eventDate = body.eventDate;
    if (body.organizer !== undefined) updateData.organizer = body.organizer;
    if (body.venue !== undefined) updateData.venue = body.venue;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.events !== undefined) updateData.events = body.events;
    if (body.matchFormat !== undefined) updateData.matchFormat = body.matchFormat;
    if (body.applicationDeadline !== undefined) updateData.applicationDeadline = body.applicationDeadline;
    if (body.entryFee !== undefined) updateData.entryFee = body.entryFee;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.tournamentUrl !== undefined) updateData.tournamentUrl = body.tournamentUrl;
    if (body.contactInfo !== undefined) updateData.contactInfo = body.contactInfo;
    if (body.snsUrls !== undefined) updateData.snsUrls = body.snsUrls;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prisma.tournament.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });

    const response: TournamentResponse = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      eventDate: updated.eventDate,
      organizer: updated.organizer,
      venue: updated.venue,
      address: updated.address,
      latitude: updated.latitude,
      longitude: updated.longitude,
      events: updated.events,
      matchFormat: updated.matchFormat,
      applicationDeadline: updated.applicationDeadline,
      entryFee: updated.entryFee,
      paymentMethod: updated.paymentMethod,
      tournamentUrl: updated.tournamentUrl,
      contactInfo: updated.contactInfo,
      snsUrls: updated.snsUrls as TournamentResponse['snsUrls'],
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      creator: updated.creator,
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/tournaments/[id]
 * Delete a tournament
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    if (tournament.creatorId !== user.id) {
      throw new ForbiddenError('Only the creator can delete this tournament');
    }

    await prisma.tournament.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
