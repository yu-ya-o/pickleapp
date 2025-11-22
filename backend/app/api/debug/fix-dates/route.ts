import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/debug/fix-dates
 * Update all past events to have future dates
 */
export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Get all past events
    const pastEvents = await prisma.event.findMany({
      where: {
        startTime: {
          lt: now,
        },
      },
    });

    console.log(`Found ${pastEvents.length} past events to update`);

    // Update each event to be in the future
    const updates = await Promise.all(
      pastEvents.map(async (event) => {
        // Calculate how many days the event is in the past
        const daysPast = Math.floor(
          (now.getTime() - event.startTime.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Move the event to tomorrow + the same offset
        const newStartTime = new Date(now);
        newStartTime.setDate(newStartTime.getDate() + 1 + daysPast);
        newStartTime.setHours(event.startTime.getHours());
        newStartTime.setMinutes(event.startTime.getMinutes());

        const duration = event.endTime.getTime() - event.startTime.getTime();
        const newEndTime = new Date(newStartTime.getTime() + duration);

        const updated = await prisma.event.update({
          where: { id: event.id },
          data: {
            startTime: newStartTime,
            endTime: newEndTime,
          },
        });

        return {
          id: updated.id,
          title: updated.title,
          oldStartTime: event.startTime.toISOString(),
          newStartTime: updated.startTime.toISOString(),
        };
      })
    );

    return NextResponse.json({
      message: `Updated ${updates.length} events`,
      updates,
    });
  } catch (error) {
    console.error('Fix dates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
