import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize the S3 client with Cloudflare R2 credentials
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileName = `${Date.now()}-${file.name}`;

    // Create a command to put the object to the bucket
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      ContentType: file.type,
    });

    // Generate a presigned URL for PUT requests (upload)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        image: fileName,
      },
    });
    return NextResponse.json({
      success: true,
      url: presignedUrl,
      fileName: fileName,
      email: session.user.email,
      message: 'Presigned URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}

// Keep body parsing disabled, as the upload happens directly to R2 via the presigned URL
export const config = {
  api: {
    bodyParser: false,
  },
};
