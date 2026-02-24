import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/errors';

/**
 * GET /api/users/rankings?type=doubles|singles
 * Get user rankings by DUPR rating (doubles or singles)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'doubles';

    const duprField = type === 'singles' ? 'duprSingles' : 'duprDoubles';

    // DUPR valid range: 2.000 - 8.000
    const DUPR_MIN = 2.0;
    const DUPR_MAX = 8.0;

    // Get users who have a valid DUPR rating
    const users = await prisma.user.findMany({
      where: {
        [duprField]: {
          not: null,
          gte: DUPR_MIN,
          lte: DUPR_MAX,
        },
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        profileImage: true,
        region: true,
        skillLevel: true,
        duprDoubles: true,
        duprSingles: true,
      },
      orderBy: {
        [duprField]: 'desc',
      },
    });

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json(rankedUsers);
  } catch (error) {
    return errorResponse(error);
  }
}
