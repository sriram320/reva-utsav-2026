import { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: string
            /**
             * By default, TypeScript expects email, name, image.
             * We add strict types here.
             */
        } & DefaultSession["user"]
    }

    interface User {
        role: string
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        role?: string
        id?: string
    }
}
