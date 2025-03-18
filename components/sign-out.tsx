import { signOut } from "@/auth"

export default function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
            }}
        >
            <button type="submit" className="underline hover:opacity-70">Sign out</button>
        </form>
    )
}
