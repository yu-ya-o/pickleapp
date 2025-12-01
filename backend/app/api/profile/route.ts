import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError } from '@/lib/errors';
import { UpdateProfileRequest, UserProfileResponse } from '@/lib/types';

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const response: UserProfileResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      nickname: user.nickname,
      bio: user.bio,
      region: user.region,
      pickleballExperience: user.pickleballExperience,
      gender: user.gender,
      ageGroup: user.ageGroup,
      skillLevel: user.skillLevel,
      duprDoubles: user.duprDoubles,
      duprSingles: user.duprSingles,
      myPaddle: user.myPaddle,
      isProfileComplete: user.isProfileComplete,
      instagramUrl: user.instagramUrl,
      twitterUrl: user.twitterUrl,
      tiktokUrl: user.tiktokUrl,
      lineUrl: user.lineUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const body: UpdateProfileRequest = await request.json();

    // Check if this update completes the profile
    // Note: ageGroup is not required for isProfileComplete to maintain backward compatibility
    // with existing users who don't have ageGroup set
    const isProfileComplete = Boolean(
      (body.nickname || user.nickname) &&
      (body.region || user.region) &&
      (body.pickleballExperience || user.pickleballExperience) &&
      (body.gender || user.gender) &&
      (body.skillLevel || user.skillLevel)
    );

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: body.nickname !== undefined ? body.nickname : user.nickname,
        bio: body.bio !== undefined ? body.bio : user.bio,
        region: body.region !== undefined ? body.region : user.region,
        pickleballExperience: body.pickleballExperience !== undefined ? body.pickleballExperience : user.pickleballExperience,
        gender: body.gender !== undefined ? body.gender : user.gender,
        ageGroup: body.ageGroup !== undefined ? body.ageGroup : user.ageGroup,
        skillLevel: body.skillLevel !== undefined ? body.skillLevel : user.skillLevel,
        duprDoubles: body.duprDoubles !== undefined ? body.duprDoubles : user.duprDoubles,
        duprSingles: body.duprSingles !== undefined ? body.duprSingles : user.duprSingles,
        myPaddle: body.myPaddle !== undefined ? body.myPaddle : user.myPaddle,
        profileImage: body.profileImage !== undefined ? (body.profileImage || null) : user.profileImage,
        instagramUrl: body.instagramUrl !== undefined ? body.instagramUrl : user.instagramUrl,
        twitterUrl: body.twitterUrl !== undefined ? body.twitterUrl : user.twitterUrl,
        tiktokUrl: body.tiktokUrl !== undefined ? body.tiktokUrl : user.tiktokUrl,
        lineUrl: body.lineUrl !== undefined ? body.lineUrl : user.lineUrl,
        isProfileComplete,
      },
    });

    const response: UserProfileResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      profileImage: updatedUser.profileImage,
      nickname: updatedUser.nickname,
      bio: updatedUser.bio,
      region: updatedUser.region,
      pickleballExperience: updatedUser.pickleballExperience,
      gender: updatedUser.gender,
      ageGroup: updatedUser.ageGroup,
      skillLevel: updatedUser.skillLevel,
      duprDoubles: updatedUser.duprDoubles,
      duprSingles: updatedUser.duprSingles,
      myPaddle: updatedUser.myPaddle,
      isProfileComplete: updatedUser.isProfileComplete,
      instagramUrl: updatedUser.instagramUrl,
      twitterUrl: updatedUser.twitterUrl,
      tiktokUrl: updatedUser.tiktokUrl,
      lineUrl: updatedUser.lineUrl,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
