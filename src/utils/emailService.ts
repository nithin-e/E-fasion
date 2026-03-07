import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
});

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Suruchi Fashion" <${env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP for Suruchi Fashion',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #f0e0cc;border-radius:12px;">
          <h2 style="color:#C8A97E;font-style:italic;">Suruchi Fashion</h2>
          <p>Your one-time password is:</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a1a2e;margin:24px 0;">${otp}</div>
          <p style="color:#666;font-size:13px;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${to}`);
  } catch (err) {
    logger.error('Failed to send OTP email:', err);
    throw new Error('Email delivery failed');
  }
};

export const sendOrderConfirmationEmail = async (
  to: string,
  orderId: string,
  total: number
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Suruchi Fashion" <${env.EMAIL_USER}>`,
      to,
      subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#C8A97E;">Order Confirmed!</h2>
          <p>Thank you for your order. Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
          <p>Total: <strong>₹${total.toLocaleString('en-IN')}</strong></p>
          <p>We'll notify you when it's dispatched.</p>
        </div>
      `,
    });
  } catch (err) {
    logger.error('Failed to send confirmation email:', err);
  }
};
