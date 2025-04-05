import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
  admin?: any;
}

export const authenticate = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
