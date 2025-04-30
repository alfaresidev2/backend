import { Router } from "express";
import authRouter from "./authRoutes";

const userRouters = Router();

//
userRouters.use("/auth", authRouter);

// Apply admin authentication middleware to all routes
export default userRouters;
