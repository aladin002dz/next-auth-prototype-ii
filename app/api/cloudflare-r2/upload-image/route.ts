import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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
      endpoint: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
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

    // Generate a unique filename or use the original name
    const fileName = `${Date.now()}-${file.name}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a command to upload the object to the bucket
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    // Execute the command to upload the object
    await s3Client.send(command);

    // Update user's image in the database
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        image: fileName, // Store just the file name
      },
    });

    return NextResponse.json({
      success: true,
      fileName: fileName,
      email: session.user.email,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Increase the body size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: false,
  },
};
