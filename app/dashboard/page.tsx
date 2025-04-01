import UpdateProfilePicture from "@/app/components/UpdateProfilePicture";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: {
      email: session.user!.email!,
    },
    select: {
      image: true,
      emailVerified: true,
    },
  });

  let imageUrl = null;
  if (user?.image) {
    if (user.image.startsWith("https://")) {
      imageUrl = user.image;
    } else {
      // For images stored in R2, we'll use the display-image endpoint
      imageUrl = `/api/cloudflare-r2/display-image?image=${encodeURIComponent(user.image)}`;
    }
  } else {
    imageUrl = `/default-avatar.svg`;
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="mx-auto bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {session?.user && (
          <>
            <div className="flex flex-col items-center gap-4">
              <UpdateProfilePicture
                currentImageUrl={imageUrl}
                userName={session.user.name || "User"}
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">{session.user.name}</h2>
                <p className="text-gray-600">{session.user.email}</p>
                <div className="mt-2">
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Email Verified
                    </span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Email Not Verified
                      </span>
                      <p className="text-xs text-gray-500">
                        Please check your email for a verification link
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Session expires: {new Date(session.expires).toLocaleDateString()} at{" "}
                {new Date(session.expires).toLocaleTimeString()}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
