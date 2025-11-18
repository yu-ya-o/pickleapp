import { OAuth2Client } from 'google-auth-library';
import { prisma } from './prisma';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_IOS);

export interface GooglePayload {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user ID
}

/**
 * Verify Google ID token and return user payload
 */
export async function verifyGoogleToken(idToken: string): Promise<GooglePayload> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID_IOS,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    if (!payload.email || !payload.sub) {
      throw new Error('Missing required fields in token');
    }

    return {
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
}

/**
 * Find or create user from Google payload
 */
export async function findOrCreateUser(payload: GooglePayload) {
  let user = await prisma.user.findUnique({
    where: { googleId: payload.sub },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        profileImage: payload.picture || null,
      },
    });
  } else {
    // Update user info if changed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: payload.name,
        profileImage: payload.picture || null,
      },
    });
  }

  return user;
}

/**
 * Get user from authorization header
 * In production, you would use JWT tokens
 * For simplicity, we're using userId directly
 */
export async function getUserFromAuth(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');

  // In production: verify JWT and extract userId
  // For now, we'll treat the token as userId directly
  const userId = token;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}
