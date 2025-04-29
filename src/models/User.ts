import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends mongoose.Document {
  email: string;
  phoneNumber?: string;
  password?: string;
  name?: string;
  profilePicture?: string;
  googleId?: string;
  role: "customer" | "influencer";
  commercialRegistrationID?: string;
  accountType?: "individual" | "agency";
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String },
  name: { type: String },
  profilePicture: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ["customer", "influencer"], required: true },
  commercialRegistrationID: { type: String, sparse: true },
  accountType: { type: String, enum: ["individual", "agency"] },
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpires: Date,
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
