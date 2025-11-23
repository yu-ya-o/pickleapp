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
      skillLevel: user.skillLevel,
      isProfileComplete: user.isProfileComplete,
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
        skillLevel: body.skillLevel !== undefined ? body.skillLevel : user.skillLevel,
        profileImage: body.profileImage !== undefined ? body.profileImage : user.profileImage,
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
      skillLevel: updatedUser.skillLevel,
      isProfileComplete: updatedUser.isProfileComplete,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
