import express from "express";
import cors from "cors";
import morgan from "morgan";

export const createApp = () => {
  const app = express();

  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  return app;
};
