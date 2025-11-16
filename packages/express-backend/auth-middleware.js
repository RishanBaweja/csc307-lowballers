import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lowballers_db_secret_key";

// Attach user if a valid cookie token exists (doesn't throw if missing)
export function attachUserIfPresent(req, _res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { _id: decoded.id, username: decoded.username };
    } catch (e) {
      // invalid/expired token: leave req.user undefined
    }
  }
  next();
}

// Require auth (401 if missing/invalid)
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { _id: decoded.id, username: decoded.username };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
