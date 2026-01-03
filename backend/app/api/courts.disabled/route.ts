import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { errorResponse, BadRequestError } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /api/courts
 * Get list of courts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const indoorOutdoor = searchParams.get('indoorOutdoor');

    const where: any = {
      status: 'ACTIVE',
    };

    if (region && region !== '全国') {
      where.region = region;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (indoorOutdoor) {
      where.indoorOutdoor = indoorOutdoor;
    }

    const courts = await prisma.court.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    return errorResponse(error);
  }
}
