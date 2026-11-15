import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "The Frame <no-reply@theframe.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY no configurada. Enlace de recuperación para ${to}: ${resetUrl}`
    );
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recupera tu contraseña de The Frame",
    html: `
      <div style="font-family: sans-serif; background:#14151A; color:#ECEAE3; padding:24px; border-radius:12px;">
        <h1 style="color:#FFB238;">THE FRAME</h1>
        <p>Has solicitado restablecer tu contraseña. Este enlace caduca en 1 hora:</p>
        <p><a href="${resetUrl}" style="color:#FFB238;">${resetUrl}</a></p>
        <p style="color:#8B8D97; font-size: 12px;">Si no has sido tú, ignora este correo.</p>
      </div>
    `,
  });
}

export async function sendNewsletterWelcome(to: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY no configurada. Bienvenida newsletter para ${to}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Te has suscrito al boletín de The Frame",
    html: `<div style="font-family: sans-serif;"><h1 style="color:#FFB238;">THE FRAME</h1><p>Gracias por suscribirte. Te avisaremos de las novedades.</p></div>`,
  });
}
