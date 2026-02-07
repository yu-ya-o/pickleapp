import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { CreateTournamentRequest, TournamentResponse } from '@/lib/types';

/**
 * GET /api/tournaments
 * Get all tournaments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    const where: any = {};

    if (statusParam) {
      where.status = statusParam;
    } else {
      where.status = 'active';
    }

    const tournaments = await prisma.tournament.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response: TournamentResponse[] = tournaments.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      eventDate: t.eventDate,
      organizer: t.organizer,
      venue: t.venue,
      address: t.address,
      latitude: t.latitude,
      longitude: t.longitude,
      events: t.events,
      matchFormat: t.matchFormat,
      applicationDeadline: t.applicationDeadline,
      entryFee: t.entryFee,
      paymentMethod: t.paymentMethod,
      tournamentUrl: t.tournamentUrl,
      contactInfo: t.contactInfo,
      snsUrls: t.snsUrls as TournamentResponse['snsUrls'],
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      creator: t.creator,
    }));

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/tournaments
 * Create a new tournament
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body: CreateTournamentRequest = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.eventDate ||
      !body.organizer ||
      !body.venue ||
      !body.events ||
      !body.matchFormat ||
      !body.applicationDeadline ||
      !body.entryFee ||
      !body.paymentMethod
    ) {
      throw new BadRequestError('Missing required fields');
    }

    const tournament = await prisma.tournament.create({
      data: {
        title: body.title,
        description: body.description,
        eventDate: body.eventDate,
        organizer: body.organizer,
        venue: body.venue,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        events: body.events,
        matchFormat: body.matchFormat,
        applicationDeadline: body.applicationDeadline,
        entryFee: body.entryFee,
        paymentMethod: body.paymentMethod,
        tournamentUrl: body.tournamentUrl || null,
        contactInfo: body.contactInfo || null,
        snsUrls: body.snsUrls ? (body.snsUrls as Prisma.InputJsonValue) : Prisma.JsonNull,
        creatorId: user.id,
      },
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
