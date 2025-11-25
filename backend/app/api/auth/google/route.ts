import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleToken, findOrCreateUser } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';
import { GoogleSignInRequest, GoogleSignInResponse } from '@/lib/types';

/**
 * POST /api/auth/google
 * Verify Google ID token and sign in user
 */
export async function POST(request: NextRequest) {
  try {
    const body: GoogleSignInRequest = await request.json();

    if (!body.idToken) {
      return NextResponse.json(
        { error: 'Missing idToken' },
        { status: 400 }
      );
    }

    // Verify Google token
    const payload = await verifyGoogleToken(body.idToken);

    // Find or create user
    const user = await findOrCreateUser(payload);

    // In production, generate JWT token
    // For simplicity, we'll return userId as token
    const token = user.id;

    const response: GoogleSignInResponse = {
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
        skillLevel: user.skillLevel,
        duprDoubles: user.duprDoubles,
        duprSingles: user.duprSingles,
        myPaddle: user.myPaddle,
        isProfileComplete: user.isProfileComplete,
      },
      token,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Google sign-in error:', error);
    return errorResponse(error);
  }
}
