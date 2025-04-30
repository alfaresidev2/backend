import { Router } from "express";
import authRouter from "./authRoutes";
import categoryRouter from "./categoryRoutes";
import influencerRoutes from "./influencerRoutes";
import { getFileUploadSignedUrl } from "../controllers/common";

const adminRoutes = Router();

//
adminRoutes.use("/auth", authRouter);
adminRoutes.use("/category", categoryRouter);
adminRoutes.use("/influencer", influencerRoutes);

//
adminRoutes.get("/upload-url", getFileUploadSignedUrl)

// Apply admin authentication middleware to all routes
export default adminRoutes;
