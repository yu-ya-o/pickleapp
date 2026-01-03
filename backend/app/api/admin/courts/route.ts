import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { getUserFromAuth, isAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/admin/courts
 * Create a new court (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!isAdmin(user.email)) {
      throw new UnauthorizedError('Admin access required');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.imageUrl || !body.region || !body.address) {
      throw new BadRequestError('Missing required fields: name, description, imageUrl, region, address');
    }

    // Set free period (3 months from now)
    const freeUntil = new Date();
    freeUntil.setMonth(freeUntil.getMonth() + 3);

    const court = await prisma.court.create({
      data: {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        imageUrls: body.imageUrls || [],
        region: body.region,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        phoneNumber: body.phoneNumber,
        websiteUrl: body.websiteUrl,
        email: body.email,
        courtsCount: body.courtsCount,
        indoorOutdoor: body.indoorOutdoor,
        surface: body.surface,
        amenities: body.amenities || [],
        operatingHours: body.operatingHours,
        priceInfo: body.priceInfo,
        status: body.status || 'ACTIVE',
        listingPlan: body.listingPlan || 'FREE',
        freeUntil,
      },
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error('Error creating court:', error);
    return errorResponse(error);
  }
}
