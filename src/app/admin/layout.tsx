import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Panel de administración</h1>
      <AdminNav />
      {children}
    </div>
  );
}
