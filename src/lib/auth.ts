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
          include: {
            schoolLinks: {
              include: {
                school: true
              }
            }
          }
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
          email: user.userId,
          name: user.name,
          schools: user.schoolLinks.map(link => ({
            id: link.school.id,
            name: link.school.name
          })),
          courses: user.courses,
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
        token.schools = (user as any).schools
        token.courses = (user as any).courses
        token.avatar = (user as any).avatar
        token.role = (user as any).role
        token.userId = (user as any).userId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).schools = token.schools
        ;(session.user as any).courses = token.courses
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
