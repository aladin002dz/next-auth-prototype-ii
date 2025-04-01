import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Initialize the S3 client with Cloudflare R2 credentials
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    // Get the image name from the query params or use default
    const url = new URL(request.url);
    const imageName = url.searchParams.get('image') || '1743017680938-image2.png';

    // Create a command to get the object from the bucket
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: imageName,
    });

    // Generate a presigned URL for GET requests
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Return the presigned URL
    return NextResponse.json({
      url: presignedUrl,
      fileName: imageName,
      message: 'Presigned URL generated successfully for GET request',
    });
  } catch (error) {
    console.error('Error generating presigned URL for GET:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
