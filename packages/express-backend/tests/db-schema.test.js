import mongoose from "mongoose";
import { User, Item, Catalog, Conversation, Message } from "../db-schema.js";

test("User model is defined correctly", () => {
  expect(User).toBeDefined();
  expect(User.modelName).toBe("User");

  // Check some key fields
  const usernamePath = User.schema.path("username");
  expect(usernamePath).toBeDefined();
  expect(usernamePath.instance).toBe("String");
  expect(usernamePath.options.required).toBe(true);
});

test("Item model is defined correctly", () => {
  expect(Item).toBeDefined();
  expect(Item.modelName).toBe("Item");

  const userIdPath = Item.schema.path("userID");
  expect(userIdPath).toBeDefined();
  expect(userIdPath.instance).toBe("ObjectId");
  expect(userIdPath.options.required).toBe(true);
});

test("Conversation and Message models exist", () => {
  expect(Conversation).toBeDefined();
  expect(Message).toBeDefined();

  // Conversation has a compound unique index
  const indexes = Conversation.schema.indexes();
  const hasCompoundIndex = indexes.some(
    ([fields, options]) =>
      fields.buyerId === 1 &&
      fields.sellerId === 1 &&
      fields.itemId === 1 &&
      options.unique
  );
  expect(hasCompoundIndex).toBe(true);
});
