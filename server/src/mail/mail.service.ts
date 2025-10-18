import * as fs from 'fs';
import * as path from 'path';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendConfirmationEmail(to: string, token: string) {
    const confirmUrl = `${this.configService.get<string>('CLIENT_URL')}/confirm?token=${token}`;
    const html = this.renderTemplate('confirm-account.html', {
      confirmUrl,
      currentYear: new Date().getFullYear().toString(),
    });

    await this.transporter
      .sendMail({
        from: `"Support" <${this.configService.get('SMTP_USER')}>`,
        to,
        subject: 'Confirm your account',
        html,
      })
      .catch((err) => {
        console.error('Failed to send confirmation email:', err);
        throw new InternalServerErrorException('Failed to send email');
      });
  }

  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    const filePath = path.join(__dirname, 'templates', templateName);
    let template = fs.readFileSync(filePath, 'utf8');

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      template = template.replace(placeholder, value);
    });

    return template;
  }
}
