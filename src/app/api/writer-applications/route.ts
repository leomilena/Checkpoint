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

  const name = parsed.data.name.trim();
  const email = parsed.data.email.toLowerCase().trim();

  try {
    await prisma.writerApplication.create({
      data: { name, email, message: parsed.data.message.trim() },
    });
  } catch (error) {
    console.error("Error al guardar la solicitud de redactor:", error);
    return NextResponse.json({ error: "No se ha podido enviar la solicitud" }, { status: 500 });
  }

  // La solicitud ya está guardada; si fallase el aviso a los admins no debe
  // impedir confirmar al solicitante que se ha enviado correctamente.
  try {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "WRITER_APPLICATION" as const,
          message: `Nueva solicitud para escribir: ${name} (${email})`,
        })),
      });
    }
  } catch (error) {
    console.error("Error al notificar la solicitud de redactor a los admins:", error);
  }

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
