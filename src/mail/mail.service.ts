import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(userName, email, token: string) {
    const url = `${process.env.APP_URL}/auth/confirm/${token}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Selamat Datang di Tumbaspedia!',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: userName,
        url,
      },
    });
  }

  async sendShopConfirmation(shopName, email, token: string) {
    const url = `${process.env.APP_URL}/auth/shop/confirm/${token}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Selamat Datang di Tumbaspedia Seller!',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: shopName,
        url,
      },
    });
  }

  async sendPasswordReset(email, token: string) {
    const url = `${process.env.APP_URL}/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <
      subject: 'Reset Password',
      template: './reset-password', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        url,
      },
    });
  }
}