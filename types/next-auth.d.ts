import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      isAdmin: boolean
      name?: string | null
      image?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    username: string
    email: string
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    email?: string
    isAdmin?: boolean
  }
}
