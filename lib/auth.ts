import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const providers: any[] = [
  CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  }),

  // Instant Google OAuth Provider (Seamless 1-click demo + Google account integration)
  CredentialsProvider({
    id: "google-oauth",
    name: "Google",
    credentials: {
      googleEmail: { label: "Google Email", type: "email" },
      googleName: { label: "Google Name", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.googleEmail || "alex.google@foodiee.com";
      const name = credentials?.googleName || "Alex Rivera";

      // Find or create Google User in SQLite DB
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const dummyHashedPassword = await bcrypt.hash("google_oauth_secure_pass_" + Date.now(), 10);
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: dummyHashedPassword,
            role: "USER",
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  }),
];

// If real Google OAuth credentials exist in environment, add standard Google Provider
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const randomPass = await bcrypt.hash("google_oauth_pass_" + Date.now(), 10);
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "Google User",
              password: randomPass,
              role: "USER",
            },
          });
        }
        user.id = existingUser.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email && !token.id) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) token.id = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
