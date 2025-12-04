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

function searchItemsByName(searchTerm) {
  // Case-insensitive search using regex for both name and location
  const regex = new RegExp(searchTerm, 'i');
  return Item.find({ 
    $or: [
      { itemName: { $regex: regex } },
      { location: { $regex: regex } }
    ]
  }).populate("userID");
}

function getItemsByLocation(location) {
  // Exact match for location filter
  return Item.find({ location: location }).populate("userID");
}

function searchItemsWithLocationFilter(searchTerm, location) {
  // Search by name/description AND filter by exact location
  const regex = new RegExp(searchTerm, 'i');
  return Item.find({ 
    location: location,
    $or: [
      { itemName: { $regex: regex } },
      { description: { $regex: regex } }
    ]
  }).populate("userID");
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
  searchItemsByName,
  getItemsByLocation,
  searchItemsWithLocationFilter,
};
