import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import db from "./db-services.js";
import itemServices from "./item-services.js";
import messageServices from "./message-services.js";
import authRoutes from "./auth-routes.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { attachUserIfPresent, requireAuth } from "./auth-middleware.js";
import { User } from "./db-schema.js";

// Load .env from project root
config({ path: "../../.env" });

// Debug: Check if environment variables are loaded
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("DB_NAME loaded:", !!process.env.DB_NAME);

const app = express();
const port = process.env.PORT || 8000;

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage: files stored as <userId>-timestamp.ext
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Config for both azure apps and local development
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://green-flower-09638de1e.3.azurestaticapps.net",
      "https://lowballers-efdua2e5h8fsg5bx.westus3-01.azurewebsites.net"
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
        const { name, description, location, amount, genre, image } =
          req.body;
        const newItem = await itemServices.addItem({
          userID: req.user?._id,
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

    app.get("/me", requireAuth, async (req, res) => {
      try {
        const userId = req.user._id;

        // 1. Fetch the user from DB
        const user = await db.findUserById(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // 2. Fetch that user's items
        const items = await itemServices.getItemsByUserId(userId);
        const mappedItems = items.map(itemServices.mapItemToResponse);

        // 3. Return a clean profile object
        res.status(200).json({
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio || "",
          profilePicture: user.profilePicture,
          itemsListed: mappedItems,
        });
      } catch (err) {
        console.error("Error fetching /me:", err);
        res.status(500).json({ error: err.message });
      }
    });

    app.patch("/me", requireAuth, async (req, res) => {
      try {
        const userId = req.user._id;
        const { username, displayName, bio, profilePicture } = req.body;

        const updates = {};
        if (username !== undefined) updates.username = username;
        if (displayName !== undefined) updates.displayName = displayName;
        if (bio !== undefined) updates.bio = bio;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
          new: true,
          runValidators: true,
        });

        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }

        const items = await itemServices.getItemsByUserId(userId);
        const mappedItems = items.map(itemServices.mapItemToResponse);

        res.status(200).json({
          id: updatedUser._id,
          username: updatedUser.username,
          displayName: updatedUser.displayName,
          bio: updatedUser.bio || "",
          profilePicture: updatedUser.profilePicture,
          itemsListed: mappedItems,
        });
      } catch (err) {
        console.error("Error updating /me:", err);
        res.status(500).json({ error: err.message });
      }
    });

    // Upload & save profile picture
    app.post(
      "/me/profile-picture",
      requireAuth,
      upload.single("profilePicture"), // "avatar" must match the field name in the form
      async (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
          }

          // This is the URL the frontend can use
          const profilePictureUrl = `/uploads/${req.file.filename}`;

          // Save it on the user document
          await User.findByIdAndUpdate(req.user._id, {
            profilePicture: profilePictureUrl,
          });

          res.status(200).json({ profilePicture: profilePictureUrl });
        } catch (err) {
          console.error("Error uploading profile picture:", err);
          res.status(500).json({ error: "Failed to upload profile picture" });
        }
      }
    );



    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Mongo connect failed:", err);
    process.exit(1);
  }
}
start();