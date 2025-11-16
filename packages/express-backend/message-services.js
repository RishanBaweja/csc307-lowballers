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
async function getMessagesForUser(myUserId, otherUserId, itemId) {
  const conv = await Conversation.findOne({
    itemId,
    $or: [
      { buyerId: myUserId, sellerId: otherUserId },
      { buyerId: otherUserId, sellerId: myUserId },
    ],
  }).lean();

  if (!conv) return [];

  const q = { conversationId: conv_.id };
  return Message.find(q).sort({ createdAt: -1 }.lean());
}

async function sendMessage(myUserId, otherUserId, itemId, message) {
  if (!message) {
    throw new Error("You have to send something");
  }
  let conv = await Conversation.findOne({
    itemId,
    $or: [
      { buyerId: myUserId, sellerId: otherUserId },
      { buyerId: otherUserId, sellerId: myUserId },
    ],
  }).lean();

  // If the conversation does not exist, create it
  if (!conv) {
    //THIS NEEDS TO BE CHANGED. IT SHOULD BE A FUNCTION THAT RETURNS IF ITEM IS IN MY_USER CATALOG
    if (itemId in items.getItems()) {
      conv = await Conversation.create({
        itemId,
        buyerId: otherUserId,
        sellerId: myUserId,
        lastMessageAt: new Date(), // should be Date.now automatically
      });
    } else {
      conv = await Conversation.create({
        itemId,
        buyerId: myUserId,
        sellerId: otherUserId,
        lastMessageAt: new Date(), // should be Date.now automatically
      });
    }
  }
  const msg = await Message.create({
    conversationId: conv._id,
    senderId: myUserId,
    text: message,
  });

  await Converstaion.updateOne(
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
  return msg;
}

export default { getInboxForUser, getMessagesForUser, sendMessage };
