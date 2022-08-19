import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

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
    const url = `${process.env.APP_URL}/auth/reset-password/${token}`;

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

  async sendShopOrderNotification(
    transaction: Transaction,
  ) {
    await this.mailerService.sendMail({
      to: transaction.shop.user.email,
      subject: 'Pesanan Baru',
      template: './shop-order-notification', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        shopName: transaction.shop.name,
        productName: transaction.product.name,
        quantity: transaction.quantity,
        productPrice: transaction.product.price,
        totalPrice: transaction.total,
        userAddress: transaction.user.address,
        userName: transaction.user.name,
        userPhoneNumber: transaction.user.phone_number,
      },
    });
  }
}
