import { handlers } from "@/auth" // Referring to the auth.ts we just created
//export const runtime = 'nodejs' // Add this line to fix the Prisma Edge runtime error
export const { GET, POST } = handlers