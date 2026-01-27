import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/errors';

/**
 * GET /api/stats
 * Get public statistics (event count, team count)
 */
export async function GET() {
  try {
    // 全イベント数（個人イベント + チームイベント）
    const [eventCount, teamEventCount, teamCount] = await Promise.all([
      prisma.event.count(),
      prisma.teamEvent.count(),
      prisma.team.count({
        where: { visibility: 'public' }
      }),
    ]);

    return NextResponse.json({
      eventCount: eventCount + teamEventCount,
      teamCount,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
