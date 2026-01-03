import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { errorResponse, NotFoundError } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /api/courts/[id]
 * Get court details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const court = await prisma.court.findUnique({
      where: { id },
    });

    if (!court) {
      throw new NotFoundError('Court not found');
    }

    return NextResponse.json(court);
  } catch (error) {
    console.error('Error fetching court:', error);
    return errorResponse(error);
  }
}
