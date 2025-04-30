import { Router } from "express";
import * as authController from "../controllers/authController";

const authRouter = Router();

// Register a new user
authRouter.post("/register", authController.register);

// Verify OTP
authRouter.post("/verify-otp", authController.verifyOTP);

// Login
authRouter.post("/login", authController.login);

// Google Login/Signup
authRouter.post("/google", authController.googleAuth);

// Forgot password
authRouter.post("/forgot-password", authController.forgotPassword);

// Reset password
authRouter.post("/reset-password", authController.resetPassword);

export default authRouter;
