import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Custom type for email sending result to avoid 'any' types
interface EmailSendResult {
  messageId: string;
  envelope: {
    from: string;
    to: string[];
  };
  accepted: string[];
  rejected: string[];
  pending: string[];
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Create transporter with SMTP configuration
    // For development, we'll use ethereal.email for testing
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.ethereal.email',
      port: this.configService.get('SMTP_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER') || 'ethereal_user',
        pass: this.configService.get('SMTP_PASS') || 'ethereal_pass',
      },
    });
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<EmailSendResult | undefined> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Rainbow Shine" <noreply@rainbowshine.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #ff6b6b; text-align: center;">Welcome to Rainbow Shine! 🌈</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up! To complete your registration and start creating beautiful memories,
            please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 12px 30px;
                      text-decoration: none;
                      border-radius: 25px;
                      display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            With love from,<br>
            The Rainbow Shine Team
          </p>
        </div>
      `,
    };

    // For development, log the URL since ethereal emails won't actually send
    console.log('📧 Verification Email Preview:', verificationUrl);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('Email sent:', info.messageId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return info as EmailSendResult;
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw error in production to avoid revealing SMTP issues
      // You might want to use a queue system for production
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<EmailSendResult | undefined> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Rainbow Shine" <noreply@rainbowshine.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #ff6b6b; text-align: center;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your Rainbow Shine account.
            Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                      color: white;
                      padding: 12px 30px;
                      text-decoration: none;
                      border-radius: 25px;
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #f5576c;">${resetUrl}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour for security reasons.<br>
            If you didn't request this password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            With love from,<br>
            The Rainbow Shine Team
          </p>
        </div>
      `,
    };

    // For development, log the URL
    console.log('📧 Password Reset Email Preview:', resetUrl);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('Password reset email sent:', info.messageId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return info as EmailSendResult;
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(
    email: string,
    spaceName: string,
    inviterName: string,
    token: string,
  ): Promise<EmailSendResult | undefined> {
    const invitationUrl = `${this.configService.get('FRONTEND_URL')}/spaces/invite/${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Rainbow Shine" <noreply@rainbowshine.com>',
      to: email,
      subject: `You're invited to join ${spaceName} on Rainbow Shine!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #ff6b6b; text-align: center;">You're Invited! 🌟</h2>
          <p style="color: #666; line-height: 1.6;">
            ${inviterName} has invited you to join their space "<strong>${spaceName}</strong>" on Rainbow Shine!
            Together you can create and share beautiful memories on an interactive map.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}"
               style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                      color: white;
                      padding: 12px 30px;
                      text-decoration: none;
                      border-radius: 25px;
                      display: inline-block;
                      font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${invitationUrl}" style="color: #fa709a;">${invitationUrl}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This invitation will expire in 7 days. After accepting, you'll be able to share memories with ${inviterName}.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            With love from,<br>
            The Rainbow Shine Team
          </p>
        </div>
      `,
    };

    // For development, log the URL
    console.log('📧 Invitation Email Preview:', invitationUrl);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('Invitation email sent:', info.messageId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return info as EmailSendResult;
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }
  }
}
