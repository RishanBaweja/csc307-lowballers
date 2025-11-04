import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
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
            ref: "Item"
        }
    ],
    itemsInterested: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        }
    ]
});

const User = mongoose.model("User", UserSchema);

const ItemSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
        min: 1
    },
    genre: {
        type: String,
        trim: true,
    },
    image: {
        type: String, // URL to the item image?
        trim: true,
    }
});

const Item = mongoose.model("Item", ItemSchema);

const CatalogSchema = new mongoose.Schema({
    itemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const Catalog = mongoose.model("Catalog", CatalogSchema);

const MessageSchema = new mongoose.Schema({
    buyerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    itemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
    }
});

const Message = mongoose.model("Message", MessageSchema);

const InboxSchema = new mongoose.Schema({
    messageID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true
    }
});

const Inbox = mongoose.model("Inbox", InboxSchema);

export { User, Item, Catalog, Message, Inbox };