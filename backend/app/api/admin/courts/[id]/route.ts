import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { errorResponse, UnauthorizedError, NotFoundError } from '@/lib/errors';
import { getUserFromAuth, isAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * PATCH /api/admin/courts/[id]
 * Update a court (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!isAdmin(user.email)) {
      throw new UnauthorizedError('Admin access required');
    }

    const { id } = await params;
    const body = await request.json();

    // Check if court exists
    const existingCourt = await prisma.court.findUnique({
      where: { id },
    });

    if (!existingCourt) {
      throw new NotFoundError('Court not found');
    }

    // Update court
    const court = await prisma.court.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.imageUrl && { imageUrl: body.imageUrl }),
        ...(body.imageUrls && { imageUrls: body.imageUrls }),
        ...(body.region && { region: body.region }),
        ...(body.address && { address: body.address }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.courtsCount !== undefined && { courtsCount: body.courtsCount }),
        ...(body.indoorOutdoor !== undefined && { indoorOutdoor: body.indoorOutdoor }),
        ...(body.surface !== undefined && { surface: body.surface }),
        ...(body.amenities && { amenities: body.amenities }),
        ...(body.operatingHours !== undefined && { operatingHours: body.operatingHours }),
        ...(body.priceInfo !== undefined && { priceInfo: body.priceInfo }),
        ...(body.status && { status: body.status }),
        ...(body.listingPlan && { listingPlan: body.listingPlan }),
        ...(body.freeUntil && { freeUntil: new Date(body.freeUntil) }),
      },
    });

    return NextResponse.json(court);
  } catch (error) {
    console.error('Error updating court:', error);
    return errorResponse(error);
  }
}

/**
 * DELETE /api/admin/courts/[id]
 * Delete a court (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!isAdmin(user.email)) {
      throw new UnauthorizedError('Admin access required');
    }

    const { id } = await params;

    // Check if court exists
    const existingCourt = await prisma.court.findUnique({
      where: { id },
    });

    if (!existingCourt) {
      throw new NotFoundError('Court not found');
    }

    // Delete court
    await prisma.court.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Court deleted successfully' });
  } catch (error) {
    console.error('Error deleting court:', error);
    return errorResponse(error);
  }
}
