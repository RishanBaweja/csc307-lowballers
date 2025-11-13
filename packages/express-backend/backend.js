import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import db from "./db-services.js";
import authRoutes from "./auth-routes.js";
import cookieParser from "cookie-parser";

// Load .env from project root
config({ path: "../../.env" });

// Debug: Check if environment variables are loaded
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("DB_NAME loaded:", !!process.env.DB_NAME);

const app = express();
const port = 8000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser())

mongoose.set("debug", true);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Connected DB:", mongoose.connection.name);

    // Basic API endpoint
    app.get("/", (req, res) => {
      res.send("Hello world!");
    });
    
    // Auth routes (for login, register, logout, verify)
    app.use("/auth", authRoutes);


    // User-related endpoints
    app.get("/users", async (req, res) => {
      try {
        const users = await db.getUsers();
        const mapped = users.map(u => ({
          id: u._id,
          username: u.username,
          password: u.password,
        }));
        res.status(200).json({ users_list: mapped });
      } catch (err) {
        console.error("could not fetch users:", err);
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/users/:id", async (req, res) => {
      try {
        const user = await db.findUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json({
          id: user._id,
          username: user.username,
          password: user.password,
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/users", async (req, res) => {
      try {
        const { username, password } = req.body;
        const newUser = await db.addUser({
          username: username,
          password: password,
        });
        res.status(201).json({
          id: newUser._id,
          username: newUser.username,
          password: newUser.password,
        });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        await db.deleteUser(req.params.id);
        res.status(204).end();
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Mongo connect failed:", err);
    process.exit(1);
  }
}
start();
