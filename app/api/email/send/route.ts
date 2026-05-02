import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL_USER,
    pass: process.env.GOOGLE_EMAIL_PASSWORD,
  },
});

type EmailType = "password-reset" | "email-verification";

function buildPasswordResetHtml(token: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
            <tr>
              <td style="padding:32px 40px;text-align:center;background:linear-gradient(135deg,#1d4ed8,#7c3aed);">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">🔐 Gouvernance Cybersécurité</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 12px;">Réinitialisation du mot de passe</h2>
                <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
                  Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous. Il est valable <strong style="color:#e2e8f0;">15 minutes</strong>.
                </p>
                <div style="text-align:center;margin:0 0 28px;">
                  <div style="display:inline-block;background:#0f172a;border:2px solid #3b82f6;border-radius:12px;padding:20px 40px;">
                    <span style="font-size:36px;font-weight:800;color:#60a5fa;letter-spacing:8px;">${token}</span>
                  </div>
                </div>
                <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
                <p style="color:#475569;font-size:12px;margin:0;">© ${new Date().getFullYear()} Gouvernance Cybersécurité · Sécurité & Conformité</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

function buildVerificationHtml(token: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
            <tr>
              <td style="padding:32px 40px;text-align:center;background:linear-gradient(135deg,#059669,#0d9488);">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">✅ Vérification de l'email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 12px;">Confirmez votre adresse email</h2>
                <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
                  Entrez le code ci-dessous pour vérifier votre compte. Valable <strong style="color:#e2e8f0;">15 minutes</strong>.
                </p>
                <div style="text-align:center;margin:0 0 28px;">
                  <div style="display:inline-block;background:#0f172a;border:2px solid #10b981;border-radius:12px;padding:20px 40px;">
                    <span style="font-size:36px;font-weight:800;color:#34d399;letter-spacing:8px;">${token}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
                <p style="color:#475569;font-size:12px;margin:0;">© ${new Date().getFullYear()} Gouvernance Cybersécurité</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, token } = body as {
      type: EmailType;
      to: string;
      token: string;
    };

    if (!type || !to || !token) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    const emailConfig: Record<EmailType, { subject: string; html: string }> = {
      "password-reset": {
        subject: "🔐 Réinitialisation de votre mot de passe",
        html: buildPasswordResetHtml(token),
      },
      "email-verification": {
        subject: "✅ Vérifiez votre adresse email",
        html: buildVerificationHtml(token),
      },
    };

    const { subject, html } = emailConfig[type];

    await transporter.sendMail({
      from: `"Gouvernance Cybersécurité" <${process.env.GOOGLE_EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[email/send] Erreur:", error);
    return NextResponse.json(
      { error: "Échec de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
