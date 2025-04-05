import "dotenv/config";
import { createApp } from "./config/app";
import { connectDB } from "./config/database";
import authRoutes from "./api/admin/routes/authRoutes";

const app = createApp();
const port = process.env.PORT || 3001;

// Routes
app.use("/api/admin", authRoutes);

// Connect to database and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
