import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Shop } from '../shops/entities/shop.entity';

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

  async sendAdminShopVerificationNotification(shop: Shop) {
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: 'Verifikasi Toko Baru #' + shop.id + ' - ' + shop.name,
      template: './admin-shop-verification-notification', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        shopName: shop.name,
        shopDescription: shop.description,
        shopUserPhoneNumber: shop.user.phone_number,
        shopAddress: shop.address,
        shopUserName: shop.user.name,
      },
    });
  }

  async sendMailVerificationShop(shop: Shop) {
    await this.mailerService.sendMail({
      to: shop.user.email,
      subject: 'Toko ' + shop.name + 'Milik Anda Telah Terverifikasi',
      template: './shop-verified', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        shopName: shop.name,
        shopDescription: shop.description,
        shopUserPhoneNumber: shop.user.phone_number,
        shopAddress: shop.address,
        shopUserName: shop.user.name,
      },
    });
  }

  async sendPasswordReset(email, token: string) {
    const url = `${process.env.APP_URL}/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <
      subject: 'Reset Password Akun Tumbaspedia',
      template: './reset-password', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        url,
      },
    });
  }

  async sendShopOrderNotification(transaction: Transaction) {
    await this.mailerService.sendMail({
      to: transaction.shop.user.email,
      subject: 'Pesanan Baru Transaksi #' + transaction.id,
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

  async sendUserOrderNotification(transaction: Transaction) {
    await this.mailerService.sendMail({
      to: transaction.user.email,
      subject: 'Pesanan Baru Transaksi #' + transaction.id,
      template: './user-order-notification', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        shopName: transaction.shop.name,
        productName: transaction.product.name,
        quantity: transaction.quantity,
        productPrice: transaction.product.price,
        totalPrice: transaction.total,
      },
    });
  }
}
