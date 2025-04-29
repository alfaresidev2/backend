import nodemailer from "nodemailer";
import twilio from "twilio";

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// SMS configuration
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export const sendOtpByEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    if (!process.env.EMAIL_USER) {
      // For development, just log the OTP
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return true;
    }

    await emailTransporter.sendMail({
      from: `"Influencer App" <${process.env.EMAIL_USER}>`,
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
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

export const sendOtpBySms = async (
  phoneNumber: string,
  otp: string
): Promise<boolean> => {
  try {
    if (!twilioClient) {
      // For development, just log the OTP
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    await twilioClient.messages.create({
      body: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
};

// Main function to send OTP based on provided contact info
export const sendOtp = async (
  contactInfo: { email?: string; phoneNumber?: string },
  otp: string
): Promise<{ success: boolean; method: string }> => {
  if (contactInfo.email) {
    const success = await sendOtpByEmail(contactInfo.email, otp);
    return { success, method: "email" };
  } else if (contactInfo.phoneNumber) {
    const success = await sendOtpBySms(contactInfo.phoneNumber, otp);
    return { success, method: "sms" };
  }
  return { success: false, method: "none" };
};
