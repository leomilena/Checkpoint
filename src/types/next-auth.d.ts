import type { Role, ThemePreference } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      avatarColor: string;
      avatarImageUrl?: string;
      themePreference: ThemePreference;
    };
  }

  interface User {
    id: string;
    role: Role;
    avatarColor: string;
    avatarImageUrl?: string;
    themePreference: ThemePreference;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    avatarColor: string;
    avatarImageUrl?: string;
    themePreference: ThemePreference;
  }
}
