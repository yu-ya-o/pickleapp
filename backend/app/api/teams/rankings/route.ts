import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/errors';

/**
 * GET /api/teams/rankings?type=members|events
 * Get team rankings by member count or public event count
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'members';

    // Get all public teams
    const teams = await prisma.team.findMany({
      where: {
        visibility: 'public',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: {
              where: {
                visibility: 'public',
                status: 'active',
              },
            },
          },
        },
      },
    });

    // Map teams with ranking data
    const teamsWithStats = teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      iconImage: team.iconImage,
      headerImage: team.headerImage,
      region: team.region,
      visibility: team.visibility,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      owner: team.owner,
      memberCount: team._count.members,
      publicEventCount: team._count.events,
      instagramUrl: team.instagramUrl,
      twitterUrl: team.twitterUrl,
      tiktokUrl: team.tiktokUrl,
      lineUrl: team.lineUrl,
    }));

    // Sort based on type
    const sortedTeams = teamsWithStats.sort((a, b) => {
      if (type === 'events') {
        // Sort by public event count (descending)
        if (b.publicEventCount !== a.publicEventCount) {
          return b.publicEventCount - a.publicEventCount;
        }
      } else {
        // Sort by member count (descending)
        if (b.memberCount !== a.memberCount) {
          return b.memberCount - a.memberCount;
        }
      }
      // If counts are equal, sort by created date (older teams first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Add rank to each team
    const rankedTeams = sortedTeams.map((team, index) => ({
      ...team,
      rank: index + 1,
    }));

    return NextResponse.json(rankedTeams);
  } catch (error) {
    return errorResponse(error);
  }
}
