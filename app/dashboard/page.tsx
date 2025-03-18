import { auth } from "@/auth";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="mx-auto bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {session?.user && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500">
                <Image
                  src={session.user.image || "/default-avatar.svg"}
                  alt={session.user.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
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
