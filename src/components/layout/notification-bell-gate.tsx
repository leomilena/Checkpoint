"use client";

import { useSession } from "next-auth/react";
import { NotificationBell } from "@/components/layout/notification-bell";

export function NotificationBellGate() {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;
  return <NotificationBell />;
}
