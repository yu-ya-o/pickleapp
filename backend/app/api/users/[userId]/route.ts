import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

/**
 * GET /api/users/[userId]
 * Get a user's public profile
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        profileImage: true,
        bio: true,
        region: true,
        pickleballExperience: true,
        gender: true,
        ageGroup: true,
        skillLevel: true,
        myPaddle: true,
        duprSingles: true,
        duprDoubles: true,
        instagramUrl: true,
        twitterUrl: true,
        tiktokUrl: true,
        lineUrl: true,
        battleRecords: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      profileImage: user.profileImage,
      bio: user.bio,
      region: user.region,
      pickleballExperience: user.pickleballExperience,
      gender: user.gender,
      ageGroup: user.ageGroup,
      skillLevel: user.skillLevel,
      myPaddle: user.myPaddle,
      duprSingles: user.duprSingles,
      duprDoubles: user.duprDoubles,
      instagramUrl: user.instagramUrl,
      twitterUrl: user.twitterUrl,
      tiktokUrl: user.tiktokUrl,
      lineUrl: user.lineUrl,
      battleRecords: user.battleRecords as any[] | null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
