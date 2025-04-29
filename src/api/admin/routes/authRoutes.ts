import { Router } from "express";
import { adminLogin } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const authRouter = Router();

authRouter.post("/login", adminLogin);
authRouter.get("/protected", authenticate, (req, res) => {
  res.json({ message: "Protected admin route accessed successfully" });
});

export default authRouter;
