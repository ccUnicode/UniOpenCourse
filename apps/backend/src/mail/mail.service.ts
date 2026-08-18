import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { escapeHtml } from './html.utils';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_BREVO_TIMEOUT_MS = 15_000;

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    const mailFrom = this.config.get<string>('MAIL_FROM');
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const timeoutMs = Number(
      this.config.get<string>('BREVO_REQUEST_TIMEOUT_MS') ?? DEFAULT_BREVO_TIMEOUT_MS,
    );

    if (!apiKey || !mailFrom) {
      throw new InternalServerErrorException(
        'Email service is not configured (BREVO_API_KEY / MAIL_FROM)',
      );
    }

    const verifyUrl = `${frontendUrl}/verificar-email?token=${encodeURIComponent(token)}`;
    const safeName = escapeHtml(name);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verifica tu correo electrónico</h2>
        <p>Hola ${safeName},</p>
        <p>Gracias por registrarte en UniOpenCourse. Haz clic en el botón para verificar tu cuenta:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verificar correo
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Si no creaste esta cuenta, ignora este mensaje.
        </p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">
          Enlace alternativo: ${verifyUrl}
        </p>
      </div>
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: this.parseSenderEmail(mailFrom), name: 'UniOpenCourse' },
          to: [{ email: to, name }],
          subject: 'Verifica tu correo - UniOpenCourse',
          htmlContent,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new InternalServerErrorException(
          `Brevo API error (${response.status}): ${body}`,
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new InternalServerErrorException(
          `Brevo API request timed out after ${timeoutMs}ms`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseSenderEmail(mailFrom: string): string {
    const match = mailFrom.match(/<([^>]+)>/);
    return match ? match[1] : mailFrom;
  }
}
