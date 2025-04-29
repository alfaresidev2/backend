import { Router } from "express";
import authRouter from "./authRoutes";
import categoryRouter from "./categoryRoutes";

const adminRoutes = Router();

//
adminRoutes.use("/auth", authRouter);
adminRoutes.use("/category", categoryRouter);

// Apply admin authentication middleware to all routes
export default adminRoutes;
