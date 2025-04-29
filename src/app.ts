import "dotenv/config";
import { createApp } from "./config/app";
import { connectDB } from "./config/database";
import appAuthRoutes from "./api/app/routes/authRoutes";
import adminRoutes from "./api/admin/routes";

const app = createApp();
const port = process.env.PORT || 3001;

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/app/auth", appAuthRoutes);

// Connect to database and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
