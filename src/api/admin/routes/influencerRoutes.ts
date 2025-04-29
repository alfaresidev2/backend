import express from "express";
import {
  getAllInfluencers,
  getInfluencerById,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  verifyInfluencer,
  searchInfluencers,
} from "../controllers/influencerController";
import { authenticate } from "../middlewares/auth";

const influencerRoutes = express.Router();

// Apply admin authentication middleware to all routes
influencerRoutes.use(authenticate);

// Get all influencers
influencerRoutes.get("/", getAllInfluencers);

// Search influencers
influencerRoutes.get("/search", searchInfluencers);

// Get a single influencer
influencerRoutes.get("/:id", getInfluencerById);

// Create a new influencer
influencerRoutes.post("/", createInfluencer);

// Update an influencer
influencerRoutes.put("/:id", updateInfluencer);

// Delete an influencer
influencerRoutes.delete("/:id", deleteInfluencer);

// Verify an influencer
influencerRoutes.patch("/:id/verify", verifyInfluencer);

export default influencerRoutes;
