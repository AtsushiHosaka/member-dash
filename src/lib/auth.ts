import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId },
          include: { school: true }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email || user.userId,
          name: user.name,
          schoolId: user.schoolId,
          schoolName: user.school.name,
          course: user.course,
          avatar: user.avatar,
          role: user.role,
          userId: user.userId
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.schoolId = (user as any).schoolId
        token.schoolName = (user as any).schoolName
        token.course = (user as any).course
        token.avatar = (user as any).avatar
        token.role = (user as any).role
        token.userId = (user as any).userId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).schoolId = token.schoolId
        ;(session.user as any).schoolName = token.schoolName
        ;(session.user as any).course = token.course
        ;(session.user as any).avatar = token.avatar
        ;(session.user as any).role = token.role
        ;(session.user as any).userId = token.userId
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  }
}
