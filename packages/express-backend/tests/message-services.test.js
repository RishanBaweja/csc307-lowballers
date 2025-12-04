// tests/message-services.test.js
import { jest } from "@jest/globals";
import messageServices from "../message-services.js";
import itemServices from "../item-services.js";
import { Conversation, Message, Item } from "../db-schema.js";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getInboxForUser", () => {
  test("returns conversations for user, sorted and limited", async () => {
    const fakeConvos = [{ _id: "c1" }];
    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeConvos),
    };
    const findMock = jest.spyOn(Conversation, "find").mockReturnValue(query);

    const result = await messageServices.getInboxForUser("u1");

    expect(findMock).toHaveBeenCalledWith({
      $or: [{ buyerId: "u1" }, { sellerId: "u1" }],
    });
    expect(query.sort).toHaveBeenCalledWith({ lastMessageAt: -1 });
    expect(query.limit).toHaveBeenCalledWith(30);
    expect(query.lean).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeConvos);
  });
});

describe("getMessagesForConversation", () => {
  test("returns [] when conversation not found", async () => {
    const convQuery = { lean: jest.fn().mockResolvedValue(null) };

    const findByIdMock = jest
      .spyOn(Conversation, "findById")
      .mockReturnValue(convQuery);

    const result = await messageServices.getMessagesForConversation("c1");

    expect(findByIdMock).toHaveBeenCalledWith("c1");
    expect(result).toEqual([]);
  });

  test("returns messages when conversation exists", async () => {
    const conv = { _id: "c1" };
    const convQuery = { lean: jest.fn().mockResolvedValue(conv) };
    jest.spyOn(Conversation, "findById").mockReturnValue(convQuery);

    const fakeMsgs = [{ _id: "m1" }];
    const msgQuery = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeMsgs),
    };
    const findMock = jest.spyOn(Message, "find").mockReturnValue(msgQuery);

    const result = await messageServices.getMessagesForConversation("c1");

    expect(findMock).toHaveBeenCalledWith({ conversationId: "c1" });
    expect(msgQuery.sort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(msgQuery.populate).toHaveBeenCalledWith(
      "senderId",
      "displayName username"
    );
    expect(msgQuery.lean).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeMsgs);
  });
});

describe("sendMessage", () => {
  test("throws if text is missing (undefined)", async () => {
    await expect(
      messageServices.sendMessage({
        myUserId: "u1",
        otherUserId: "u2",
        itemId: "i1",
        // no text field at all
      })
    ).rejects.toThrow("You have to send something");
  });

  test("throws if text is missing (undefined)", async () => {
  await expect(
    messageServices.sendMessageToConversation({
      conversationId: "c1",
      myUserId: "u1",
      // no text field at all
    })
  ).rejects.toThrow("You have to send something");
});

  
  test("throws if text is empty", async () => {
    await expect(
      messageServices.sendMessage({
        myUserId: "u1",
        otherUserId: "u2",
        itemId: "i1",
        text: "   ",
      })
    ).rejects.toThrow("You have to send something");
  });

  test("throws if item is not found", async () => {
    const itemSpy = jest
      .spyOn(itemServices, "findItemById")
      .mockResolvedValue(null);

    await expect(
      messageServices.sendMessage({
        myUserId: "u1",
        otherUserId: "u2",
        itemId: "i1",
        text: "hello",
      })
    ).rejects.toThrow("Item not found");

    expect(itemSpy).toHaveBeenCalledWith("i1");
  });
  

  test("creates conversation, message, updates conversation and returns populated message (using toObject)", async () => {
    // Item exists
    jest.spyOn(itemServices, "findItemById").mockResolvedValue({
      _id: "i1",
      userID: "owner-id",
    });

    const fakeConv = { _id: "c1", buyerId: "u1", sellerId: "owner-id" };
    const convUpdateMock = jest
      .spyOn(Conversation, "findOneAndUpdate")
      .mockResolvedValue(fakeConv);

    const msgCreatedAt = new Date("2024-01-01T00:00:00Z");
    const msgDoc = {
      _id: "m1",
      text: "hello world",
      createdAt: msgCreatedAt,
      populate: jest.fn(),
    };

    // populate() returns an object with toObject() so we hit that branch
    const toObjectMock = jest.fn().mockReturnValue({
      id: "m1",
      text: "hello world",
    });
    msgDoc.populate.mockResolvedValue({
      toObject: toObjectMock,
    });

    const createMsgMock = jest
      .spyOn(Message, "create")
      .mockResolvedValue(msgDoc);

    const convUpdateOneMock = jest
      .spyOn(Conversation, "updateOne")
      .mockResolvedValue({ acknowledged: true });

    const result = await messageServices.sendMessage({
      myUserId: "u1",
      otherUserId: "u2",
      itemId: "i1",
      text: "hello world",
    });

    expect(convUpdateMock).toHaveBeenCalledTimes(1);
    expect(createMsgMock).toHaveBeenCalledTimes(1);
    expect(convUpdateOneMock).toHaveBeenCalledTimes(1);

    // Ensure preview and lastMessageAt are based on createdAt
    const updateArgs = convUpdateOneMock.mock.calls[0][1];
    expect(updateArgs.$set.lastMessage.preview).toBe("hello world".slice(0, 15));
    expect(updateArgs.$set.lastMessage.createdAt).toBe(msgCreatedAt);
    expect(updateArgs.$set.lastMessageAt).toBe(msgCreatedAt);

    expect(msgDoc.populate).toHaveBeenCalledWith(
      "senderId",
      "displayName username"
    );
    expect(toObjectMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      conversation: fakeConv,
      message: { id: "m1", text: "hello world" },
    });
  });
  test("creates conversation when myUserId is the seller (buyerId = otherUserId)", async () => {
  // Item owned by the sender
  jest.spyOn(itemServices, "findItemById").mockResolvedValue({
    _id: "i1",
    userID: "owner-id",
  });

  const fakeConv = { _id: "c2", buyerId: "other-id", sellerId: "owner-id" };
  const convUpdateMock = jest
    .spyOn(Conversation, "findOneAndUpdate")
    .mockResolvedValue(fakeConv);

  const msgCreatedAt = new Date("2024-03-01T00:00:00Z");
  const msgDoc = {
    _id: "m2",
    text: "seller message",
    createdAt: msgCreatedAt,
    populate: jest.fn(),
  };

  // populate returns a plain object (no toObject) – we don't care here
  const populated = { id: "m2", text: "seller message" };
  msgDoc.populate.mockResolvedValue(populated);

  jest.spyOn(Message, "create").mockResolvedValue(msgDoc);
  const updateOneMock = jest
    .spyOn(Conversation, "updateOne")
    .mockResolvedValue({ acknowledged: true });

  const result = await messageServices.sendMessage({
    myUserId: "owner-id",   // same as sellerId
    otherUserId: "other-id",
    itemId: "i1",
    text: "seller message",
  });

  // Verify that when me === sellerId, buyerId is set to otherUserId
  const [filter] = convUpdateMock.mock.calls[0];
  expect(filter).toEqual({
    itemId: "i1",
    buyerId: "other-id",
    sellerId: "owner-id",
  });

  expect(updateOneMock).toHaveBeenCalledTimes(1);
  expect(msgDoc.populate).toHaveBeenCalledWith(
    "senderId",
    "displayName username"
  );
  expect(result).toEqual({
    conversation: fakeConv,
    message: populated,
  });
  });

});

describe("sendMessageToConversation", () => {
  test("throws if text is missing (undefined)", async () => {
    await expect(
      messageServices.sendMessageToConversation({
        conversationId: "c1",
        myUserId: "u1",
        // no text
      })
    ).rejects.toThrow("You have to send something");
  });

  test("throws if text is empty", async () => {
    await expect(
      messageServices.sendMessageToConversation({
        conversationId: "c1",
        myUserId: "u1",
        text: "   ",
      })
    ).rejects.toThrow("You have to send something");
  });

  test("throws if conversation not found", async () => {
    jest.spyOn(Conversation, "findById").mockResolvedValue(null);

    await expect(
      messageServices.sendMessageToConversation({
        conversationId: "c1",
        myUserId: "u1",
        text: "hello",
      })
    ).rejects.toThrow("Conversation not found");
  });

  test("creates message, updates conversation and returns populated message (plain object branch)", async () => {
    const conv = { _id: "c1" };
    jest.spyOn(Conversation, "findById").mockResolvedValue(conv);

    const msgCreatedAt = new Date("2024-02-01T00:00:00Z");
    const msgDoc = {
      _id: "m1",
      text: "hi there",
      createdAt: msgCreatedAt,
      populate: jest.fn(),
    };
    // populate returns a plain object (no toObject), so we hit the "else" branch
    const populated = { id: "m1", text: "hi there" };
    msgDoc.populate.mockResolvedValue(populated);

    const createMsgMock = jest
      .spyOn(Message, "create")
      .mockResolvedValue(msgDoc);

    const updateOneMock = jest
      .spyOn(Conversation, "updateOne")
      .mockResolvedValue({ acknowledged: true });

    const result = await messageServices.sendMessageToConversation({
      conversationId: "c1",
      myUserId: "u1",
      text: "hi there",
    });

    expect(createMsgMock).toHaveBeenCalledTimes(1);
    expect(updateOneMock).toHaveBeenCalledTimes(1);
    const updateArgs = updateOneMock.mock.calls[0][1];
    expect(updateArgs.$set.lastMessage.preview).toBe("hi there".slice(0, 15));
    expect(updateArgs.$set.lastMessage.createdAt).toBe(msgCreatedAt);
    expect(updateArgs.$set.lastMessageAt).toBe(msgCreatedAt);

    // We don't assert on msgDoc.populate call details here; just that the function returned populated
    expect(result).toEqual(populated);
  });

  test("creates message, updates conversation and returns populated message via toObject (toObject branch)", async () => {
    const conv = { _id: "c2" };
    jest.spyOn(Conversation, "findById").mockResolvedValue(conv);

    const msgCreatedAt = new Date("2024-02-02T00:00:00Z");
    const msgDoc = {
      _id: "m2",
      text: "hello from toObject",
      createdAt: msgCreatedAt,
      populate: jest.fn(),
    };

    const toObjectResult = { id: "m2", text: "hello from toObject" };
    const toObjectMock = jest.fn().mockReturnValue(toObjectResult);

    // populate returns an object with toObject(), so we hit the "true" side of the ternary
    msgDoc.populate.mockResolvedValue({ toObject: toObjectMock });

    jest.spyOn(Message, "create").mockResolvedValue(msgDoc);
    jest
      .spyOn(Conversation, "updateOne")
      .mockResolvedValue({ acknowledged: true });

    const result = await messageServices.sendMessageToConversation({
      conversationId: "c2",
      myUserId: "u1",
      text: "hello from toObject",
    });

    expect(toObjectMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(toObjectResult);
  });
});


describe("startConversationFromItem", () => {
  test("throws if item not found", async () => {
    const query = {
      lean: jest.fn().mockResolvedValue(null),
    };
    jest.spyOn(Item, "findById").mockReturnValue(query);

    await expect(
      messageServices.startConversationFromItem({
        myUserId: "me",
        otherUserId: "other",
        itemId: "i1",
      })
    ).rejects.toThrow("Item not found");
  });

  test("throws if item missing seller userID", async () => {
    const query = {
      lean: jest.fn().mockResolvedValue({ _id: "i1" }),
    };
    jest.spyOn(Item, "findById").mockReturnValue(query);

    await expect(
      messageServices.startConversationFromItem({
        myUserId: "me",
        otherUserId: "other",
        itemId: "i1",
      })
    ).rejects.toThrow("Item is missing seller userID");
  });

  test("uses item.userID when present", async () => {
    const item = { _id: "i1", userID: "seller-id" };
    const query = {
      lean: jest.fn().mockResolvedValue(item),
    };
    jest.spyOn(Item, "findById").mockReturnValue(query);

    const fakeConv = { _id: "c1" };
    const updateMock = jest
      .spyOn(Conversation, "findOneAndUpdate")
      .mockResolvedValue(fakeConv);

    const result = await messageServices.startConversationFromItem({
      myUserId: "me",
      otherUserId: "other",
      itemId: "i1",
    });

    const [filter, update, options] = updateMock.mock.calls[0];

    expect(filter).toEqual({
      itemId: "i1",
      buyerId: "me",
      sellerId: "seller-id",
    });
    expect(update.$setOnInsert).toEqual({
      itemId: "i1",
      buyerId: "me",
      sellerId: "seller-id",
      lastMessageAt: expect.any(Date),
    });
    expect(options).toEqual({ upsert: true, new: true });
    expect(result).toBe(fakeConv);
  });

  test("falls back to item.userId when userID missing", async () => {
    const item = { _id: "i1", userId: "seller-alt" };
    const query = {
      lean: jest.fn().mockResolvedValue(item),
    };
    jest.spyOn(Item, "findById").mockReturnValue(query);

    const fakeConv = { _id: "c2" };
    const updateMock = jest
      .spyOn(Conversation, "findOneAndUpdate")
      .mockResolvedValue(fakeConv);

    const result = await messageServices.startConversationFromItem({
      myUserId: "me",
      otherUserId: "other",
      itemId: "i1",
    });

    const [filter] = updateMock.mock.calls[0];
    expect(filter).toEqual({
      itemId: "i1",
      buyerId: "me",
      sellerId: "seller-alt",
    });
    expect(result).toBe(fakeConv);
  });

  test("falls back to item.sellerId when userID and userId missing", async () => {
    const item = { _id: "i1", sellerId: "seller-third" };
    const query = {
      lean: jest.fn().mockResolvedValue(item),
    };
    jest.spyOn(Item, "findById").mockReturnValue(query);

    const fakeConv = { _id: "c3" };
    const updateMock = jest
      .spyOn(Conversation, "findOneAndUpdate")
      .mockResolvedValue(fakeConv);

    const result = await messageServices.startConversationFromItem({
      myUserId: "seller-third", // equal to seller -> other becomes buyer
      otherUserId: "other",
      itemId: "i1",
    });

    const [filter] = updateMock.mock.calls[0];
    expect(filter).toEqual({
      itemId: "i1",
      buyerId: "other", // because myUserId === sellerId
      sellerId: "seller-third",
    });
    expect(result).toBe(fakeConv);
  });
});
