import { Request, Response } from "express";
import { Admin } from "../../../models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "365d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
