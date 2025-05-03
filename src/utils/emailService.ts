import nodemailer from "nodemailer";

// Email configuration
const emailTransporter = nodemailer.createTransport({
  // service: process.env.EMAIL_SERVICE || "gmail",
  host: process.env.EMAIL_HOST, // e.g., 'your-email-address@gmail.com'
  port: 587, // or 465 for SSL
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Interface for email options
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: {
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Send an email
 * @param options Email options
 * @returns Promise resolving to success status and any error message
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    // Send the email
    return await emailTransporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Influencer App"}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
      replyTo: options.replyTo,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    return null;
  }
};

/**
 * Send a verification code email
 * @param email Recipient email
 * @param otp Verification code
 * @returns Promise resolving to success status
 */
export const sendVerificationEmail = async (email: string, otp: string) => {
  return await sendEmail({
    to: email,
    subject: "Your verification code",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Verification Code</h2>
    <p>Your verification code is:</p>
    <h1 style="font-size: 32px; letter-spacing: 5px; background-color: #f4f4f4; padding: 10px; text-align: center;">${otp}</h1>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
    </div>
    `,
    text: `Your verification code is: ${otp}. This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`,
  });
};

/**
 * Send welcome email to a new user
 * @param email Recipient email
 * @param name User's name
 * @returns Promise resolving to success status
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  return await sendEmail({
    to: email,
    subject: "Welcome to Influencer App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Influencer App!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>You can now log in to your account and start exploring our features.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || "https://yourapp.com"}/login" 
             style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            Log In to Your Account
          </a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Influencer App Team</p>
      </div>
    `,
    text: `Welcome to Influencer App! Hello ${name}, Thank you for joining our platform. We're excited to have you on board! You can now log in to your account and start exploring our features. If you have any questions, feel free to contact our support team. Best regards, The Influencer App Team`,
  });
};

/**
 * Send login credentials to a user
 * @param email Recipient email
 * @param password Temporary password
 * @returns Promise resolving to success status
 */
export const sendCredentialsEmail = async (email: string, password: string) => {
  const result = await sendEmail({
    to: email,
    subject: "Your Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Login Credentials</h2>
        <p>Hello,</p>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p><strong>Important:</strong> Please log in and change your password immediately for security reasons.</p>
        <div style="margin: 30px 0;">
          <a href="#" 
             style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            Log In Now
          </a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Influencer App Team</p>
      </div>
    `,
    text: `Your Login Credentials: Email: ${email}, Password: ${password}. Please log in and change your password immediately.`,
  });

  return result;
};
