import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth } from '@/lib/auth';
import { errorResponse, UnauthorizedError, BadRequestError } from '@/lib/errors';

/**
 * POST /api/upload/image
 * Upload image to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUserFromAuth(authHeader);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new BadRequestError('No file provided');
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const uploadData = new FormData();
    uploadData.append('file', dataUrl);
    uploadData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'picklehub');
    uploadData.append('folder', 'profile_images');

    const uploadResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: uploadData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const result = await uploadResponse.json();

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return errorResponse(error);
  }
}
