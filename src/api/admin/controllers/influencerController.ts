import { Request, Response } from "express";
import { Influencer } from "../../../models/Influencer";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../../../utils/emailService";

// Get all influencers
export const getAllInfluencers = async (req: Request, res: Response) => {
  try {
    const influencers = await Influencer.find({}, { password: 0 }).populate("category");
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single influencer by ID
export const getInfluencerById = async (req: Request, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.params.id, { password: 0 }).populate("category");
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
    const updatedInfluencer = await Influencer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      projection: { password: 0 },
    }).populate("category");

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
    const deletedInfluencer = await Influencer.findByIdAndDelete(req.params.id, { projection: { password: 0 } });

    if (!deletedInfluencer) {
      return res.status(404).json({ message: "Influencer not found" });
    }

    res.json({ message: "Influencer deleted successfully" });
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

    const influencers = await Influencer.find(query, { password: 0 }).populate("category");
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const sendCredentialEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the influencer
    const influencer = await Influencer.findById(id);

    if (!influencer) {
      return res.status(404).json({ message: "Influencer not found" });
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-8);

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update influencer with password and set emailSent status
    influencer.password = hashedPassword;
    influencer.updates = { ...influencer.updates, welcomeMailWithPasswordSent: true, welcomeMailWithPasswordSentAt: new Date() };

    // Save the influencer with updated password and emailSent status
    await influencer.save();

    // Send email with credentials
    const emailSent = await sendCredentialsEmail(influencer.email, password);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send email" });
    }

    return res.status(200).json({
      message: "Credentials sent successfully",
      emailSent: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
