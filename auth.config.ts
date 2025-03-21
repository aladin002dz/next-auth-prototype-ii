import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth"
 
// Notice this is only an object, not a full Auth.js instance
export default {
    providers: [
        Google,
        GitHub,
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const password = credentials?.password
                const email = credentials?.email
                let user = null

                //warning: password must be "hashed" in real projects,this is only for demo purposes 
                if (email === "aurore@domain.com" && password === "12345678") {
                    user = {
                        id: "1",
                        name: "Aurore Davis",
                        email: "aurore@domain.com",
                    }
                }

                if (!user) {
                    // No user found, so this is their first attempt to login
                    // Optionally, this is also the place you could do a user registration
                    throw new Error("Invalid credentials.")
                }

                // return user object with their profile data
                return user
            },
        }),
    ],
} satisfies NextAuthConfig