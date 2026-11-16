import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writerApplicationSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/session";

export async function POST(req: Request) {
  if (!rateLimit(`writer-application:${getClientIp(req)}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }

  const parsed = writerApplicationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del formulario" }, { status: 400 });
  }

  // El campo trampa venía relleno: lo tratamos como spam sin decírselo al bot.
  if (parsed.data.website) {
    return NextResponse.json({ message: "¡Solicitud enviada!" });
  }

  await prisma.writerApplication.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      message: parsed.data.message.trim(),
    },
  });

  return NextResponse.json({ message: "¡Solicitud enviada!" });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const applications = await prisma.writerApplication.findMany({
    orderBy: [{ reviewed: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ applications });
}
