import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma/prisma"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";

// Disable Edge runtime for auth routes
export const runtime = 'nodejs'

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
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
    callbacks: {
        /*async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
            }
            return token;
        },*/
        /*async session({ session, token }) {
            // Send properties to the client
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },*/
        async signIn({ user, account }) {
            // Always allow Credentials provider
            if (!account) return true;
            if (account.provider === 'credentials') return true;
            
            try {
                // For OAuth providers, check if we need to link accounts
                if (user.email) {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { accounts: true },
                    });
                    
                    if (existingUser) {
                        // Check if this provider is already linked
                        const existingAccount = existingUser.accounts.find(
                            (acc: any) => acc.provider === account.provider
                        );
                        
                        // If already linked, proceed with sign-in
                        if (existingAccount) return true;
                        
                        // Otherwise, link the new provider
                        try {
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: "oauth",
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    refresh_token: account.refresh_token ?? null,
                                    access_token: account.access_token ?? null,
                                    expires_at: account.expires_at ?? null,
                                    token_type: account.token_type ?? null,
                                    scope: account.scope ?? null,
                                    id_token: account.id_token ? String(account.id_token) : null,
                                    session_state: account.session_state ?? null
                                },
                            });
                            return true;
                        } catch (error) {
                            console.error("Error linking account:", error);
                            // Allow sign-in anyway, even if linking fails
                            return true;
                        }
                    }
                }
                
                // For new users, let the adapter handle account creation
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                // Allow sign-in anyway, to avoid blocking users
                return true;
            }
        },
    },
    debug: process.env.NODE_ENV === 'development',
})