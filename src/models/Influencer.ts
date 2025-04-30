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
      welcomeMailWithPasswordSentAt: { type: Date },
    },
    password: {
      type: String,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    socialMedia: [
      {
        platform: {
          type: String,
          enum: ["Instagram", "YouTube", "TikTok", "Twitter", "Facebook", "LinkedIn", "Other"],
        },
        handle: {
          type: String,
        },
        followers: {
          type: Number,
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
    tags: [String],
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
    images: [{ type: String }],
    videos: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Influencer = mongoose.model("Influencer", InfluencerSchema);
