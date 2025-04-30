import { sendVerificationEmail } from "./emailService";
import { sendOtpBySms } from "./smsService";

// Main function to send OTP based on provided contact info
export const sendOtp = async (contactInfo: { email?: string; phoneNumber?: string }, otp: string) => {
  try {
    if (contactInfo.email) await sendVerificationEmail(contactInfo.email, otp);
    if (contactInfo.phoneNumber) await sendOtpBySms(contactInfo.phoneNumber, otp);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
