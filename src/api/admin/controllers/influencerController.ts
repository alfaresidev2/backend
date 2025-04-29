import { Request, Response } from "express";
import { Influencer } from "../../../models/Influencer";

// Get all influencers
export const getAllInfluencers = async (req: Request, res: Response) => {
  try {
    const influencers = await Influencer.find().populate("category");
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single influencer by ID
export const getInfluencerById = async (req: Request, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.params.id).populate("category");
    if (!influencer) {
      return res.status(404).json({ message: "Influencer not found" });
    }
    res.json(influencer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new influencer
export const createInfluencer = async (req: Request, res: Response) => {
  try {
    const newInfluencer = new Influencer(req.body);
    const savedInfluencer = await newInfluencer.save();
    res.status(201).json(savedInfluencer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update an influencer
export const updateInfluencer = async (req: Request, res: Response) => {
  try {
    const updatedInfluencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("category");
    
    if (!updatedInfluencer) {
      return res.status(404).json({ message: "Influencer not found" });
    }
    
    res.json(updatedInfluencer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete an influencer
export const deleteInfluencer = async (req: Request, res: Response) => {
  try {
    const deletedInfluencer = await Influencer.findByIdAndDelete(req.params.id);
    
    if (!deletedInfluencer) {
      return res.status(404).json({ message: "Influencer not found" });
    }
    
    res.json({ message: "Influencer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify an influencer
export const verifyInfluencer = async (req: Request, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    
    if (!influencer) {
      return res.status(404).json({ message: "Influencer not found" });
    }
    
    influencer.isVerified = true;
    await influencer.save();
    
    res.json({ message: "Influencer verified successfully", influencer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search influencers by criteria
export const searchInfluencers = async (req: Request, res: Response) => {
  try {
    const { platform, category, minFollowers, maxFollowers, location, isVerified } = req.query;
    
    const query: any = {};
    
    if (platform) {
      query["socialMedia.platform"] = platform;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    
    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }
    
    if (minFollowers || maxFollowers) {
      query["socialMedia.followers"] = {};
      
      if (minFollowers) {
        query["socialMedia.followers"].$gte = parseInt(minFollowers as string);
      }
      
      if (maxFollowers) {
        query["socialMedia.followers"].$lte = parseInt(maxFollowers as string);
      }
    }
    
    const influencers = await Influencer.find(query).populate("category");
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};