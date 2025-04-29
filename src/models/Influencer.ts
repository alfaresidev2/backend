import mongoose, { Schema } from "mongoose";

const InfluencerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    updates: {
      welcomeMailWithPasswordSent: { type: Boolean, default: false },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    socialMedia: [
      {
        platform: {
          type: String,
          required: [true, "Platform name is required"],
          enum: ["Instagram", "YouTube", "TikTok", "Twitter", "Facebook", "LinkedIn", "Other"],
        },
        handle: {
          type: String,
          required: [true, "Social media handle is required"],
        },
        followers: {
          type: Number,
          required: [true, "Number of followers is required"],
        },
        url: {
          type: String,
        },
      },
    ],
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    bio: {
      type: String,
    },
    location: {
      type: String,
    },
    engagementRate: {
      type: Number,
    },
    profileImage: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Influencer = mongoose.model("Influencer", InfluencerSchema);
