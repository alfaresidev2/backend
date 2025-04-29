import "dotenv/config";
import { createApp } from "./config/app";
import { connectDB } from "./config/database";
import adminAuthRoutes from "./api/admin/routes/authRoutes";
import appAuthRoutes from "./api/app/routes/authRoutes";

const app = createApp();
const port = process.env.PORT || 3001;

// Routes
app.use("/api/admin", adminAuthRoutes);
app.use("/api/app/auth", appAuthRoutes);

// Connect to database and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
