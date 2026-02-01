
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const [user] = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1);
                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password as string, user.password);
                if (isValid) {
                    return {
                        ...user,
                        role: user.role || 'user',
                        id: user.id.toString(),
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            // Check if user exists
            const [existingUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

            // Check if super admin
            const admins = process.env.ADMIN_EMAILS?.split(',') || [];
            const isAdmin = admins.includes(user.email);
            const role = isAdmin ? 'admin' : 'user';

            if (!existingUser) {
                await db.insert(users).values({
                    email: user.email,
                    name: user.name || "Unknown",
                    image: user.image,
                    role: role,
                    password: "",
                });
            } else if (isAdmin && existingUser.role !== 'admin') {
                // Auto-promote if in env list
                await db.update(users).set({ role: 'admin' }).where(eq(users.email, user.email));
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                const [dbUser] = await db.select().from(users).where(eq(users.email, user.email!)).limit(1);
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser.id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.role) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/staff-login', // Custom login page
        error: '/staff-login', // Error page
    }
})
