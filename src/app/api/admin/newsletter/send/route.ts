import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { sendNewsletterCampaign, isEmailConfigured } from "@/lib/email";

const schema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

const BATCH_SIZE = 20;

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (!isEmailConfigured) {
    return NextResponse.json(
      { error: "No se puede enviar: falta configurar RESEND_API_KEY en las variables de entorno" },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos no válidos" }, { status: 400 });
  }

  const { subject, body } = parsed.data;
  const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((s) => sendNewsletterCampaign(s.email, subject, body))
    );
    for (const r of results) {
      if (r.status === "fulfilled") sent += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
