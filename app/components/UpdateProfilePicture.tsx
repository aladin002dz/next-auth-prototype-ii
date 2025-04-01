'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface UpdateProfilePictureProps {
    currentImageUrl: string;
    userName: string;
}

export default function UpdateProfilePicture({ currentImageUrl, userName }: UpdateProfilePictureProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>(currentImageUrl);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPresignedUrl = async () => {
            if (currentImageUrl && currentImageUrl.includes('/api/cloudflare-r2/display-image')) {
                try {
                    setIsLoading(true);
                    const response = await fetch(currentImageUrl);
                    const data = await response.json();
                    if (data.url) {
                        setImageUrl(data.url);
                    }
                } catch (error) {
                    console.error('Error fetching presigned URL:', error);
                    setImageUrl('/default-avatar.svg');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setImageUrl(currentImageUrl);
                setIsLoading(false);
            }
        };

        fetchPresignedUrl();
    }, [currentImageUrl]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSave = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);

            // Create FormData with the image
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Upload image to Cloudflare R2
            const uploadResponse = await fetch('/api/cloudflare-r2/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }

            const uploadData = await uploadResponse.json();
            console.log('Upload response:', uploadData);

            // Clear preview
            setPreviewUrl(null);
            setSelectedFile(null);

            // Refresh the page to show the new image
            router.refresh();
        } catch (error) {
            console.error('Error updating profile picture:', error);
            alert('Failed to update profile picture. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-blue-500">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full bg-gray-100">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <Image
                            src={previewUrl || imageUrl}
                            alt={userName || "User"}
                            fill
                            className="object-cover rounded-full"
                            priority
                        />
                    )}
                </div>
                <button
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-10 w-12 h-12 flex items-center justify-center"
                    disabled={isUploading || isLoading}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                        />
                    </svg>
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {previewUrl && (
                <div className="absolute top-full mt-2 flex gap-2">
                    <button
                        onClick={() => {
                            setPreviewUrl(null);
                            setSelectedFile(null);
                        }}
                        className="px-4 py-3 min-w-[48px] min-h-[48px] text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        disabled={isUploading || isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-3 min-w-[48px] min-h-[48px] text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isUploading || isLoading}
                    >
                        {isUploading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
} 