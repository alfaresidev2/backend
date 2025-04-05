import { Router } from "express";
import { adminLogin } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/login", adminLogin);
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "Protected admin route accessed successfully" });
});

export default router;
