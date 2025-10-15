import express from "express";
import cors from "cors";
import user_functions from "./user-services.js";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

mongoose.set("debug", true);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Mongo connected");

    // Basic API endpoint
    app.get("/", (req, res) => {
      res.send("Hello world!");
    });

    //API endpoint to get users
    app.get("/users", (req, res) => {
      const name = req.query.name;
      const job = req.query.job;

      const p =
        name !== undefined && job !== undefined
          ? user_functions.findUserByNameAndJob(name, job)
          : user_functions.getUsers(name, job);
      Promise.resolve(p)
        .then((result) => res.status(200).json({ users_list: result ?? [] }))
        .catch((err) => {
          console.error("could not fetch users:", err);
        });
    });

    //API endpoint to get users by ID
    app.get("/users/:id", (req, res) => {
      const { id } = req.params;
      return user_functions
        .findUserById(id)
        .then((result) => res.status(200).json(result))
        .catch((err) => {
          res.status(404).json({ err: "Could not find" });
        });
    });

    //Add a user to users_list
    app.post("/users", (req, res) => {
      const { name, job } = req.body ?? {};
      return user_functions
        .addUser({ name, job })
        .then((result) => res.status(201).json(result))
        .catch((err) => {
          console.error("addUser failed:", err);
        });
    });

    //Delete user from users_list by id
    app.delete("/users/:id", (req, res) => {
      const { id } = req.params;
      return user_functions
        .deleteUser(id)
        .then((result) => res.status(204).json(result))
        .catch((err) => {
          console.error("deleteUser failed:", err);
        });
    });
  } catch (err) {
    console.error("Mongo connect failed:", err);
    process.exit(1);
  }
}
start();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
