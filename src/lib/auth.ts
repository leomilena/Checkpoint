import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días de sesión persistente
  },
  pages: {
    signIn: "/entrar",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;
        if (user.banned) throw new Error("BANNED");

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarColor: user.avatarColor,
          avatarImageUrl: user.avatarImageUrl ?? undefined,
          themePreference: user.themePreference,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatarColor = (user as any).avatarColor;
        token.avatarImageUrl = (user as any).avatarImageUrl;
        token.themePreference = (user as any).themePreference;
      }
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        // El rol (y el resto de campos mutables) se lee siempre fresco de la
        // base de datos en vez de confiar en el valor cacheado en el JWT:
        // si no, un cambio de rol/ban hecho por un admin no se nota hasta
        // que esa persona cierra sesión y vuelve a entrar, lo cual no es
        // nada evidente para quien administra la web.
        const current = token.id
          ? await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, avatarColor: true, avatarImageUrl: true, themePreference: true },
            })
          : null;

        if (current) {
          (session.user as any).role = current.role;
          (session.user as any).avatarColor = current.avatarColor;
          (session.user as any).avatarImageUrl = current.avatarImageUrl;
          (session.user as any).themePreference = current.themePreference;
        } else {
          (session.user as any).role = token.role;
          (session.user as any).avatarColor = token.avatarColor;
          (session.user as any).avatarImageUrl = token.avatarImageUrl;
          (session.user as any).themePreference = token.themePreference;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
