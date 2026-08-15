import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

interface BrevoSender {
  name?: string;
  email: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Parses MAIL_FROM in either `Name <address@host>` or plain `address@host` form.
   */
  private getSender(): BrevoSender {
    const raw = this.config.get<string>('MAIL_FROM') ?? '';
    const match = /^\s*(.*?)\s*<\s*(.+?)\s*>\s*$/.exec(raw);

    if (match) {
      return { name: match[1] || 'UniOpenCourse', email: match[2] };
    }

    return { name: 'UniOpenCourse', email: raw.trim() };
  }

  private buildVerificationHtml(name: string, verifyUrl: string, expiresHours: number) {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111514; line-height: 1.6;">
        <h1 style="color: #157347; font-size: 22px;">Verifica tu correo</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en UniOpenCourse. Haz clic en el siguiente botón para confirmar tu cuenta:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}"
             style="background-color: #157347; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Verificar mi correo
          </a>
        </p>
        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #0C8A68;">${verifyUrl}</p>
        <p>Este enlace expira en ${expiresHours} horas.</p>
        <hr style="border: none; border-top: 1px solid #dddddd; margin: 24px 0;" />
        <p style="font-size: 12px; color: #666666;">
          Si no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </div>
    `;
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const expiresHours = Number(
      this.config.get<string>('EMAIL_VERIFICATION_EXPIRES_HOURS') ?? 48,
    );

    const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/verificar-email?token=${token}`;

    if (!apiKey) {
      this.logger.error(
        'BREVO_API_KEY no está configurada. No se envió el correo de verificación.',
      );
      throw new Error('Email provider not configured');
    }

    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: this.getSender(),
        to: [{ email: to, name }],
        subject: 'Verifica tu correo - UniOpenCourse',
        htmlContent: this.buildVerificationHtml(name, verifyUrl, expiresHours),
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      this.logger.error(
        `Brevo rechazó el envío a ${to}. Status ${response.status}: ${details}`,
      );
      throw new Error(`Brevo request failed with status ${response.status}`);
    }

    this.logger.log(`Correo de verificación enviado a ${to}`);
  }
}
