import Link from "next/link"
import SignOut from "./sign-out"
import { auth } from "@/auth";

export default async function Nav() {
    const session = await auth()

    return (
        <nav className="font-[family-name:var(--font-geist-sans)] p-4 pb-0">
            <div className="flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl hover:opacity-80 transition-opacity"
                >
                    Home
                </Link>
                <div className="flex items-center gap-8">
                    {
                        session &&
                        <div className="flex items-center gap-8">
                            <span>{session.user?.name || session.user?.email}</span>
                            <SignOut />
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}
