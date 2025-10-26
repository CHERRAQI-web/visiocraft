import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import categorieRoutes from "./routes/categorie.routes.js";
import projectRoutes from "./routes/projet.routes.js";
import messageRoutes from "./routes/message.routes.js";
import fileRoutes from "./routes/projectFile.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import clientRoutes from './routes/client.routes.js';
import freelancerRoutes from "./routes/freelancer.routes.js";
import statsRoutes from './routes/stats.routes.js'

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json({
  type: 'application/json',
}));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin:['http://localhost:5175', 'http://localhost:5173','http://localhost:5174','http://localhost:5176','http://localhost:8080'],
    credentials: true,sameSite: 'none',methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
  })
);

connectDB();


app.use("/api/skills", skillRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/clients", clientRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/stats', statsRoutes);

app.use("/api", messageRoutes);
app.use("/api", fileRoutes);

app.use(errorHandler);

const port = process.env.PORT ?? 5000;
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
