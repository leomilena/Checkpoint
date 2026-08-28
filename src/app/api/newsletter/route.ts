import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validation";
import { sendNewsletterWelcome } from "@/lib/email";

export async function POST(req: Request) {
  const parsed = newsletterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  await sendNewsletterWelcome(email);

  return NextResponse.json({ message: "¡Suscripción confirmada!" });
}
