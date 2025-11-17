import { User, Item, Catalog, Message, Inbox } from "./db-schema.js";

//User-related DB functions

function addUser(data) {
  const userToAdd = new User(data);
  return userToAdd.save();
}

function getUsers() {
  return User.find();
}

function findUserById(id) {
  return User.findById(id);
}

function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

//Item-related DB functions

function addItem(data) {
  const itemToAdd = new Item(data);
  return itemToAdd.save();
}

function getItems() {
  return Item.find();
}

function findItemById(id) {
  return Item.findById(id).populate("userID");
}

function deleteItem(id) {
  return Item.findByIdAndDelete(id);
}

//Message-related DB functions

function addMessage(data) {
  const messageToAdd = new Message(data);
  return messageToAdd.save();
}

function getMessages() {
  return Message.find().populate(["buyerID", "itemID"]);
}

//Catalog-related DB functions

function addCatalogEntry(data) {
  const catalogEntryToAdd = new Catalog(data);
  return catalogEntryToAdd.save();
}

function getCatalogEntries() {
  return Catalog.find().populate(["itemID", "userID"]);
}

//Inbox-related DB functions

function addInboxEntry(data) {
  const inboxEntryToAdd = new Inbox(data);
  return inboxEntryToAdd.save();
}

function getInboxEntries() {
  return Inbox.find().populate("messageID");
}

export default {
  // User functions
  addUser,
  getUsers,
  findUserById,
  deleteUser,
  // Item functions
  addItem,
  getItems,
  findItemById,
  deleteItem,
  // Message functions
  addMessage,
  getMessages,
  // Catalog functions
  addCatalogEntry,
  getCatalogEntries,
  // Inbox functions
  addInboxEntry,
  getInboxEntries,
};
