import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma/prisma"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
                const password = credentials?.password as string
                const email = credentials?.email as string
                let user = null

                if (!email || !password) {
                    throw new Error("Email and password are required.")
                }

                // Check for registered users in the database
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email },
                    })

                    // Check if user exists and has a password field
                    if (dbUser && 'password' in dbUser && dbUser.password) {
                        // Verify the password using bcrypt
                        const passwordMatch = await bcrypt.compare(password, dbUser.password as string);
                        
                        if (passwordMatch) {
                            user = {
                                id: dbUser.id,
                                name: dbUser.name,
                                email: dbUser.email,
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error finding user:", error)
                }

                if (!user) {
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
        },
        async session({ session, token }) {
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
                            (acc: { provider: string }) => acc.provider === account.provider
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
                                    session_state: account.session_state ? String(account.session_state) : null
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