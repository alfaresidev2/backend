import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

// Register a new user
router.post("/register", authController.register);

// Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// Login
router.post("/login", authController.login);

// Google Login/Signup
router.post("/google", authController.googleAuth);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password", authController.resetPassword);

export default router;
