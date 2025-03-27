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
    },
  });

  let imageUrl = null;
  if (user?.image && user.image.startsWith("https://")) {
    imageUrl = user.image;
  } else {
    imageUrl = user?.image
      ? `/api/cloudflare-r2/display-image?image=${user.image}`
      : `/default-avatar.svg`;
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
