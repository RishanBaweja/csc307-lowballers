import itemServices from "./item-services.js";
import { Conversation, Message, Item } from "./db-schema.js";

/* Gets both buyer and seller conversations for the user
 * Means that it does not matter if a user is a buyer or seller,
 * if they are involved in the conversation they will appear
 */
async function getInboxForUser(userId) {
  const base = {
    $or: [{ buyerId: userId }, { sellerId: userId }],
  };
  return Conversation.find(base).sort({ lastMessageAt: -1 }).limit(30).lean();
}

/* Gets messages for user based on conversation params
 * If there is no converation then do not display anything
 * then it returns all messages sorted by how early the conversation is
 */
async function getMessagesForConversation(conversationId) {
  const conv = await Conversation.findById(conversationId).lean();

  if (!conv) return [];

  const q = { conversationId: conv._id };

  return Message.find(q).sort({ createdAt: 1 }).lean();
}

/* Sends messages for user based on conversation params
 * If there is no converation then creates it
 * and then sends the text
 */
async function sendMessage({ myUserId, otherUserId, itemId, text }) {
  console.log("[sendMessage] args =", { myUserId, otherUserId, itemId, text });
  // Error checking on text
  if (!text || !text.trim()) {
    throw new Error("You have to send something");
  }

  // Error checking on items
  const item = await itemServices.findItemById(itemId);
  if (!item) throw new Error("Item not found");

  // For whoever owns the item check
  const sellerId = item.userID.toString();
  const me = myUserId.toString();
  const other = otherUserId.toString();

  // Whoever owns the item check
  const buyerId = me === sellerId ? other : me;

  // Find the conversation if it exists, if not create it and then return it into conv
  let conv = await Conversation.findOneAndUpdate(
    { itemId, buyerId, sellerId },
    {
      $setOnInsert: {
        itemId,
        buyerId,
        sellerId,
        lastMessageAt: new Date(0),
      },
    },
    //Make a new one if it does not exist, and then return the new one
    { upsert: true, new: true }
  );

  // Create the message
  const msg = await Message.create({
    conversationId: conv._id,
    senderId: myUserId,
    text: text.trim(),
  });

  // Update the conversation with the new message
  await Conversation.updateOne(
    { _id: conv._id },
    {
      $set: {
        lastMessage: {
          id: msg._id,
          senderId: myUserId,
          preview: msg.text.slice(0, 15),
          createdAt: msg.createdAt,
        },
        lastMessageAt: msg.createdAt,
      },
    }
  );
  // Return
  return { conversation: conv, message: msg };
}

async function sendMessageToConversation({ conversationId, myUserId, text }) {
  if (!text || !text.trim()) {
    throw new Error("You have to send something");
  }

  // 1. Find the conversation
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new Error("Conversation not found");

  // 2. Create the message
  const msg = await Message.create({
    conversationId: conv._id,
    senderId: myUserId,
    text: text.trim(),
  });

  // 3. Update conversation metadata
  await Conversation.updateOne(
    { _id: conv._id },
    {
      $set: {
        lastMessage: {
          id: msg._id,
          senderId: myUserId,
          preview: msg.text.slice(0, 15),
          createdAt: msg.createdAt,
        },
        lastMessageAt: msg.createdAt,
      },
    }
  );

  // 4. Return just the message (what your frontend expects)
  return msg.toObject ? msg.toObject() : msg;
}

async function startConversationFromItem({ myUserId, otherUserId, itemId }) {
  // 1. Load the raw item from Mongo
  const item = await Item.findById(itemId).lean();
  console.log("[startConversationFromItem] item =", item);

  if (!item) throw new Error("Item not found");

  // 2. Identify seller correctly
  const rawSeller = item.userID || item.userId || item.sellerId;
  if (!rawSeller) throw new Error("Item is missing seller userID");

  const sellerId = rawSeller.toString();
  const me = myUserId.toString();
  const other = otherUserId.toString();

  const buyerId = me === sellerId ? other : me;

  // 3. Find or create conversation
  const conv = await Conversation.findOneAndUpdate(
    { itemId, buyerId, sellerId },
    {
      $setOnInsert: {
        itemId,
        buyerId,
        sellerId,
        lastMessageAt: new Date(0),
      },
    },
    { upsert: true, new: true }
  );

  return conv;
}

export default {
  getInboxForUser,
  getMessagesForConversation,
  sendMessage,
  sendMessageToConversation,
  startConversationFromItem,
};
