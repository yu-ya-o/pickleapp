import { NextRequest, NextResponse } from 'next/server';
import { verifyAppleToken, findOrCreateAppleUser } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';
import { AppleSignInRequest, AppleSignInResponse } from '@/lib/types';

/**
 * POST /api/auth/apple
 * Verify Apple identity token and sign in user
 */
export async function POST(request: NextRequest) {
  try {
    const body: AppleSignInRequest = await request.json();

    if (!body.identityToken) {
      return NextResponse.json(
        { error: 'Missing identityToken' },
        { status: 400 }
      );
    }

    // Verify Apple token
    const payload = await verifyAppleToken(body.identityToken);

    // Find or create user
    const user = await findOrCreateAppleUser(
      payload,
      body.email,
      body.fullName
    );

    // In production, generate JWT token
    // For simplicity, we'll return userId as token
    const token = user.id;

    const response: AppleSignInResponse = {
      user: {
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
      },
      token,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Apple sign-in error:', error);
    return errorResponse(error);
  }
}
