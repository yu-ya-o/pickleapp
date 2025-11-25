import { OAuth2Client } from 'google-auth-library';
import { prisma } from './prisma';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_IOS);

export interface GooglePayload {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user ID
}

export interface ApplePayload {
  email?: string;
  sub: string; // Apple user ID
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
    // Update user info if changed (but preserve custom profile image)
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: payload.name,
        // Don't overwrite custom profile image with Google image
      },
    });
  }

  return user;
}

/**
 * Verify Apple identity token and return user payload
 * Note: For production, you should verify the token signature using Apple's public keys
 * For now, we'll decode the JWT without verification for development
 */
export async function verifyAppleToken(identityToken: string): Promise<ApplePayload> {
  try {
    // Decode the JWT (without verification for development)
    // In production, verify using Apple's public keys from https://appleid.apple.com/auth/keys
    const decoded = JSON.parse(
      Buffer.from(identityToken.split('.')[1], 'base64').toString()
    );

    if (!decoded.sub) {
      throw new Error('Missing sub field in token');
    }

    return {
      email: decoded.email,
      sub: decoded.sub,
    };
  } catch (error) {
    console.error('Apple token verification failed:', error);
    throw new Error('Invalid Apple token');
  }
}

/**
 * Find or create user from Apple payload
 */
export async function findOrCreateAppleUser(
  payload: ApplePayload,
  email?: string,
  fullName?: string
) {
  let user = await prisma.user.findUnique({
    where: { appleId: payload.sub },
  });

  if (!user) {
    // For new users, use provided email or payload email
    const userEmail = email || payload.email;

    if (!userEmail) {
      throw new Error('Email is required for new Apple Sign-In users');
    }

    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: fullName || userEmail.split('@')[0], // Use email prefix if no name provided
        appleId: payload.sub,
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
