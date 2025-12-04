import items from "./db-services.js";
import { Conversation, Message } from "./db-schema.js";

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
async function getMessagesForUser(conversationId) {
  const conv = await Conversation.findById(conversationId).lean();

  if (!conv) return [];

  const q = { conversationId: conv._id };

  return Message.find(q).sort({ createdAt: -1 }).lean(); // ← fix: .lean() is chained separately
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
  const item = await items.findItemById(itemId);
  if (!item) throw new Error("Item not found");

  // CURRENTLY WE DO NOT HAVE USERS OWN ITEMS, THIS NEEDS TO CHANGE
  // For whoever owns the item check
  // const sellerId = item.userID.toString();
  // const me = myUserId.toString();
  // const other = otherUserId.toString();

  // Whoever owns the item check
  // const buyerId = me === sellerId ? other : me;

  const buyerId = myUserId.toString();
  const sellerId = otherUserId.toString();

  let conv = await Conversation.findOneAndUpdate(
    // These will need to get changed to buyerId and sellerId once items is updated
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

  const msg = await Message.create({
    conversationId: conv._id,
    senderId: myUserId,
    text: text.trim(),
  });

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
  return { conversation: conv, message: msg };
}

export default { getInboxForUser, getMessagesForUser, sendMessage };
