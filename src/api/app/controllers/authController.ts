import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../../models/User";
import { sendOtp } from "../../../utils/otpService";
import { verifyGoogleToken } from "../../../utils/googleAuth";
import bcrypt from "bcryptjs";

// Helper function to generate OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate JWT
const generateToken = (user: any): string => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "", { expiresIn: "365d" });
};

// Google login/signup
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

    // Verify the Google token
    const googleUser = await verifyGoogleToken(idToken);

    if (!googleUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId: googleUser.googleId });

    // If no user with this Google ID, check by email
    if (!user && googleUser.email) {
      user = await User.findOne({ email: googleUser.email });

      // If user exists with this email but no Google ID, update with Google ID
      if (user) {
        user.googleId = googleUser.googleId;
        user.isVerified = true; // Auto-verify Google users
        if (!user.name) user.name = googleUser.name;
        if (!user.profilePicture) user.profilePicture = googleUser.picture;
        await user.save();
      }
    }

    // If still no user, create a new one
    if (!user) {
      user = new User({
        email: googleUser.email,
        name: googleUser.name,
        profilePicture: googleUser.picture,
        googleId: googleUser.googleId,
        role: "customer", // Default role
        isVerified: true, // Auto-verify Google users
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password, commercialRegistrationID, accountType } = req.body;

    // Validate required fields
    if (!password || (!email && !phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone number and password are required",
      });
    }

    // Check if user already exists
    const existingUser = email ? await User.findOne({ email }) : await User.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email/phone already exists",
      });
    }

    // Generate verification code
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user
    const user = new User({
      email,
      phoneNumber,
      password,
      role: "customer", // Default role for app registration
      commercialRegistrationID,
      accountType,
      verificationCode,
      verificationCodeExpires,
    });

    await user.save();

    // Send OTP via email or SMS based on provided contact info
    const sendResult = await sendOtp({ email, phoneNumber }, verificationCode);

    if (!sendResult.success) {
      // If OTP sending fails, still proceed but notify in the response
      console.error(`Failed to send OTP to ${email || phoneNumber}`);
    }

    return res.status(201).json({
      success: true,
      message: `Registration successful. Verification code sent to your ${sendResult.method}. Please verify your account.`,
      data: {
        userId: user._id,
        // Only include verification code in development environment
        ...(process.env.NODE_ENV === "development" && { verificationCode }),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== otp ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if (!password || (!email && !phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone number and password are required",
      });
    }

    const dbResponse = await User.aggregate([
      { $facet: { users: [{ $match: { email, phoneNumber } }] } },
      {
        $lookup: {
          from: "influencers",
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [{ $eq: ["$email", email] }, { $eq: ["$phoneNumber", phoneNumber] }],
                },
              },
            },
          ],
          as: "influencers",
        },
      },
      {
        $project: {
          user: { $arrayElemAt: ["$users", 0] },
          influencer: { $arrayElemAt: ["$influencers", 0] },
        },
      },
    ]);

    const userData = dbResponse?.[0];

    if (!userData?.user && !userData?.influencer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (userData?.user) {
      // // Check if the user is verified
      if (!userData?.user.isVerified) {
        // Generate new verification code
        const verificationCode = generateOTP();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.updateOne(
          { _id: userData?.user?._id },
          {
            $set: {
              verificationCode: verificationCode,
              verificationCodeExpires: verificationCodeExpires,
            },
          }
        );

        // Send OTP via email or SMS
        const sendResult = await sendOtp(
          { email: userData?.user.email, phoneNumber: userData?.user.phoneNumber },
          verificationCode
        );

        return res.status(403).json({
          success: false,
          message: `Account not verified. A verification code has been sent to your ${sendResult.method}.`,
          data: {
            userId: userData?.user?._id,
            requiresVerification: true,
            // Only include verification code in development environment
            ...(process.env.NODE_ENV === "development" && { verificationCode }),
          },
        });
      }

      // // Check password
      const isMatch = await bcrypt.compare(password, userData?.user?.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      delete userData?.user?.password;

      // // Generate token
      const token = generateToken(userData?.user);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: userData?.user._id,
            email: userData?.user.email,
            phoneNumber: userData?.user.phoneNumber,
            role: userData?.user.role,
          },
          influencer: null,
        },
      });
    }

    if (userData?.influencer) {
      // // Check password

      const isMatch = await bcrypt.compare(password, userData?.influencer?.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // // Generate token
      const token = generateToken(userData?.influencer);

      delete userData?.influencer?.password;

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: null,
          influencer: {
            ...userData?.influencer,
          },
        },
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    // Find user
    const user = email ? await User.findOne({ email }) : await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate verification code
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send OTP via email or SMS
    const sendResult = await sendOtp({ email: user.email, phoneNumber: user.phoneNumber }, verificationCode);

    return res.status(200).json({
      success: true,
      message: `Password reset OTP sent to your ${sendResult.method}`,
      data: {
        userId: user._id,
        // Only include verification code in development environment
        ...(process.env.NODE_ENV === "development" && { verificationCode }),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID, OTP, and new password are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== otp ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update password
    user.password = newPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};
