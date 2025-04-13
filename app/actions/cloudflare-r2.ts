'use server';

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create a single S3Client instance that can be reused
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
});

// Function to get a presigned URL for viewing an image
export async function getR2ImageUrl(imageName: string = 'image2.png') {
    try {
        // Create a command to get the object from the bucket
        const command = new GetObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
            Key: imageName,
        });

        // Generate a presigned URL for GET requests
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Return the presigned URL
        return {
            url: presignedUrl,
            fileName: imageName,
            message: 'Presigned URL generated successfully for GET request',
        };
    } catch (error) {
        console.error('Error generating presigned URL for GET:', error);
        throw new Error('Failed to generate presigned URL');
    }
}

// Function to get a presigned URL for uploading an image
export async function getUploadUrl(filename: string, filetype: string) {
    try {
        // Create a command to put the object in the bucket
        const command = new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
            Key: filename,
            ContentType: filetype,
        });

        // Generate a presigned URL for PUT requests
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Return the presigned URL
        return {
            url: presignedUrl,
            fileName: filename,
            message: 'Presigned URL generated successfully for PUT request',
        };
    } catch (error) {
        console.error('Error generating presigned URL for PUT:', error);
        throw new Error('Failed to generate presigned URL for upload');
    }
} 