import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./db-schema.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "lowballers_db_secret_key";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd, // set to true in production (HTTPS)
  sameSite: "None",
  maxAge:  24 * 60 * 60 * 1000, // 1 day
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    //Auto-login after registration (Had error before, fixed here)
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, cookieOptions);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.status(400).json({ message: "Invalid username or password" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(400).json({ message: "Invalid username or password" });

  // Create token
  const token = jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // Send as httpOnly cookie
  res.cookie("token", token, cookieOptions);

  res.json({
    message: "Login successful",
    user: { id: user._id, username: user.username },
  });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// VERIFY (check if user is still logged in)
router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch {
    res.status(401).json({ loggedIn: false });
  }
});

export default router;
