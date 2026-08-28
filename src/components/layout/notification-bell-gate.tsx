"use client";

import { useSession } from "next-auth/react";
import { NotificationBell } from "@/components/layout/notification-bell";

export function NotificationBellGate() {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user || (user.role !== "WRITER" && user.role !== "ADMIN")) return null;
  return <NotificationBell />;
}
