import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { attachUserIfPresent, requireAuth } from "../auth-middleware.js";

const JWT_SECRET = "lowballers_db_secret_key"; // matches default in code

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("attachUserIfPresent", () => {
  test("sets req.user when token is valid", () => {
    const token = jwt.sign(
      { id: "u1", username: "alice" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const req = { cookies: { token } };
    const res = {};
    const next = jest.fn();

    attachUserIfPresent(req, res, next);

    expect(req.user).toEqual({ _id: "u1", username: "alice" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("leaves req.user undefined when no token", () => {
    const req = { cookies: {} };
    const res = {};
    const next = jest.fn();

    attachUserIfPresent(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("ignores invalid token (no throw), still calls next", () => {
    const req = { cookies: { token: "bad-token" } };
    const res = {};
    const next = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });

    attachUserIfPresent(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("requireAuth", () => {
  test("returns 401 when no token", () => {
    const req = { cookies: {} };
    const res = createMockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token invalid", () => {
    const req = { cookies: { token: "bad" } };
    const res = createMockRes();
    const next = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token"
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("sets req.user and calls next when token valid", () => {
    const token = jwt.sign(
      { id: "u1", username: "alice" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const req = { cookies: { token } };
    const res = createMockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual({ _id: "u1", username: "alice" });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
