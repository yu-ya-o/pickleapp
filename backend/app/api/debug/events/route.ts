import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/events
 * Debug endpoint to get all events without filters
 */
export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent events
    });

    const now = new Date();
    const summary = {
      total: events.length,
      byStatus: events.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      upcoming: events.filter(e => e.startTime >= now).length,
      past: events.filter(e => e.startTime < now).length,
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        status: e.status,
        startTime: e.startTime.toISOString(),
        isPast: e.startTime < now,
        createdAt: e.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Debug events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
