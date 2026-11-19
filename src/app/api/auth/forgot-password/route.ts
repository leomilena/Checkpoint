import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/site-url";

export async function POST(req: Request) {
  if (!rateLimit(`forgot-password:${getClientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Inténtalo más tarde." }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Respuesta genérica siempre, para no filtrar qué emails existen.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const baseUrl = getBaseUrl();
    const resetUrl = `${baseUrl}/restablecer-contrasena?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return NextResponse.json({
    message: "Si el email existe, recibirás un enlace de recuperación.",
  });
}
