import { Item } from "./db-schema.js";

function getItems() {
  return Item.find();
}

function findItemById(id) {
  return Item.findById(id).populate("userID");
}

function addItem(item) {
  const itemToAdd = new Item(item);
  const promise = itemToAdd.save();
  return promise;
}

function deleteItem(id) {
  return Item.findByIdAndDelete(id);
}

function getItemsByUserId(userId) {
  // Find all items with this user's ObjectId
  return Item.find({ userID: userId });
}


// Mapping function to convert MongoDB item to frontend format
function mapItemToResponse(item) {
  return {
    id: item._id,
    userId: item.userID,
    name: item.itemName,
    description: item.description,
    location: item.location,
    amount: item.amount,
    genre: item.genre,
    image: item.image,
  };
}

export default {
  addItem,
  getItems,
  findItemById,
  deleteItem,
  mapItemToResponse,
  getItemsByUserId,
};