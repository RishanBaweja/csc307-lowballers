import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import db from "./db-services.js";
import itemServices from "./item-services.js";
import messageServices from "./message-services.js";
import authRoutes from "./auth-routes.js";
import cookieParser from "cookie-parser";
import { attachUserIfPresent, requireAuth } from "./auth-middleware.js";

// Load .env from project root
config({ path: "../../.env" });

// Debug: Check if environment variables are loaded
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("DB_NAME loaded:", !!process.env.DB_NAME);

const app = express();
const port = process.env.PORT || 8000;

// Config for both azure apps and local development
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "lowballers-efdua2e5h8fsg5bx.westus3-01.azurewebsites.net"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes); // Auth routes (for login, register, logout, verify)
app.use(attachUserIfPresent);

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

    // Item endpoints
    app.get("/items", async (req, res) => {
      try {
        const items = await itemServices.getItems();
        const mapped = items.map(itemServices.mapItemToResponse);
        res.status(200).json({ items_list: mapped });
      } catch (err) {
        console.error("could not fetch items:", err);
        res.status(500).json({ error: err.message });
      }
    });

    //ISSUE: "error": "Cast to ObjectId failed for value \"1\" (type number) at path \"_id\" for model \"User\""
    //RUN TESTS ON THIS LATER
    // http://localhost:8000/items/6913e0ae150080701a2af553
    app.get("/items/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
          return res.status(400).json({ error: "Invalid item id format" });
        }
        const item = await itemServices.findItemById(req.params.id);
        if (!item) return res.status(404).json({ error: "Item not found" });
        res.status(200).json(itemServices.mapItemToResponse(item));
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/items", async (req, res) => {
      try {
        const { name, description, location, amount, genre, image, userId } =
          req.body;
        const newItem = await itemServices.addItem({
          userID: userId || "101", // Default userId as requested
          itemName: name,
          description: description,
          location: location,
          amount: amount,
          genre: Array.isArray(genre) ? genre.join(", ") : genre,
          image: image,
        });
        res.status(201).json(itemServices.mapItemToResponse(newItem));
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete("/items/:id", async (req, res) => {
      try {
        await itemServices.deleteItem(req.params.id);
        res.status(204).end();
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    // Endpoints for messaging

    // Get conversations
    app.get("/conversation", async (req, res) => {
      try {
        const conversations = await messageServices.getInboxForUser(
          req.user._id
        );
        res.status(200).json(conversations);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    });

    // Get messages
    app.get("/conversation/:conversationId/messages", async (req, res) => {
      try {
        const { conversationId } = req.params;
        const messages =
          await messageServices.getMessagesForUser(conversationId);
        res.status(200).json(messages);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    });

    // Send a message
    app.post("/conversation/sendMessage", async (req, res) => {
      try {
        const { otherUserId, itemId, text } = req.body;
        const result = await messageServices.sendMessage({
          myUserId: req.user._id,
          otherUserId,
          itemId,
          text,
        });
        res.status(201).json(result);
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
