import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String, // URL to the profile picture?
    trim: true,
  },
  itemsListed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  itemsInterested: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
});

const User = mongoose.model("User", UserSchema);

const ItemSchema = new mongoose.Schema({
  userID: {
    type: Number, //mongoose.Schema.Types.ObjectId comment out for testing for now
    ref: "User",
    required: true,
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  genre: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL to the item image?
    trim: true,
  },
});

const Item = mongoose.model("Item", ItemSchema);

const CatalogSchema = new mongoose.Schema({
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Catalog = mongoose.model("Catalog", CatalogSchema);

/* Conversation represents the collection of messages between two users
* Ex:
** User 1 sends "Hello I am interested in this item" to User 2
** User 2 sends back "Ok lets meet up!"
*/ 

const ConversationsSchema = new mongoose.Schema({
  buyerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  lastMessage: {
    id: mongoose.Types.ObjectId,
    senderId: mongoose.Types.ObjectId,
    preview: String,
    createdAt: Date,
  },
  lastMessageAt: { type: Date, default: Date.now, index: true },
});

// Unique identifier forces only one conversation between two users for an item
ConversationSchema.index(
  { buyerId: 1, sellerId: 1, itemId: 1 },
  { unique: true }
);

const Conversation = mongoose.model("Conversation", ConversationsSchema);


/* Messages represents individual messages sent in each conversation
* Ex:
** User 1 sends "Hello I am interested in this item" to User 2
*/ 
const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const Message = mongoose.model("Message", MessageSchema);

const InboxSchema = new mongoose.Schema({
  con: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
});

const Inbox = mongoose.model("Inbox", InboxSchema);

export { User, Item, Catalog, Conversation, Message, Inbox };
