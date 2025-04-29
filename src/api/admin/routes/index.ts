import { Router } from "express";
import authRouter from "./authRoutes";
import categoryRouter from "./categoryRoutes";
import influencerRoutes from "./influencerRoutes";

const adminRoutes = Router();

//
adminRoutes.use("/auth", authRouter);
adminRoutes.use("/category", categoryRouter);
adminRoutes.use("/influencer", influencerRoutes);

// Apply admin authentication middleware to all routes
export default adminRoutes;
