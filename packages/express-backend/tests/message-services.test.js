import { jest } from "@jest/globals";
import messageServices from "../message-services.js";
import items from "../db-services.js";
import { Conversation, Message } from "../db-schema.js";


afterEach(() => {
  jest.restoreAllMocks();
});

describe("getInboxForUser", () => {
  test("returns conversations for user, sorted and limited", async () => {
    const fakeConvos = [{ _id: "c1" }];
    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeConvos)
    };
    const findMock = jest.spyOn(Conversation, "find").mockReturnValue(query);

    const result = await messageServices.getInboxForUser("u1");

    expect(findMock).toHaveBeenCalledWith({
      $or: [{ buyerId: "u1" }, { sellerId: "u1" }]
    });
    expect(query.sort).toHaveBeenCalledWith({ lastMessageAt: -1 });
    expect(query.limit).toHaveBeenCalledWith(30);
    expect(query.lean).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeConvos);
  });
});

describe("getMessagesForUser", () => {
  test("returns [] when conversation not found", async () => {
    const findByIdMock = jest
      .spyOn(Conversation, "findById")
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const result = await messageServices.getMessagesForUser("c1");

    expect(findByIdMock).toHaveBeenCalledWith("c1");
    expect(result).toEqual([]);
  });

  test("returns messages when conversation exists", async () => {
    const convQuery = { lean: jest.fn().mockResolvedValue({ _id: "c1" }) };
    jest.spyOn(Conversation, "findById").mockReturnValue(convQuery);

    const fakeMsgs = [{ _id: "m1" }];
    const msgQuery = {
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeMsgs)
    };
    const findMock = jest.spyOn(Message, "find").mockReturnValue(msgQuery);

    const result = await messageServices.getMessagesForUser("c1");

    expect(findMock).toHaveBeenCalledWith({ conversationId: "c1" });
    expect(msgQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(msgQuery.lean).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeMsgs);
  });
});

describe("sendMessage", () => {
  test("throws if text is empty", async () => {
    await expect(
      messageServices.sendMessage({
        myUserId: "u1",
        otherUserId: "u2",
        itemId: "i1",
        text: "   "
      })
    ).rejects.toThrow("You have to send something");
  });

  test("throws if item is not found", async () => {
    const itemSpy = jest
      .spyOn(items, "findItemById")
      .mockResolvedValue(null);

    await expect(
      messageServices.sendMessage({
        myUserId: "u1",
        otherUserId: "u2",
        itemId: "i1",
        text: "hello"
      })
    ).rejects.toThrow("Item not found");

    expect(itemSpy).toHaveBeenCalledWith("i1");
  });

  test("creates conversation, message, and updates conversation", async () => {
    // Item exists
    jest.spyOn(items, "findItemById").mockResolvedValue({
      _id: "i1",
      userID: "owner"
    });

    const fakeConv = { _id: "c1", buyerId: "u1", sellerId: "u2" };
    const convUpdateMock = jest
      .spyOn(Conversation, "findOneAndUpdate")
      .mockResolvedValue(fakeConv);

    const fakeMsg = {
      _id: "m1",
      text: "hello world",
      createdAt: new Date("2024-01-01")
    };
    const createMsgMock = jest
      .spyOn(Message, "create")
      .mockResolvedValue(fakeMsg);

    const convUpdateOneMock = jest
      .spyOn(Conversation, "updateOne")
      .mockResolvedValue({ acknowledged: true });

    const result = await messageServices.sendMessage({
      myUserId: "u1",
      otherUserId: "u2",
      itemId: "i1",
      text: "hello world"
    });

    expect(convUpdateMock).toHaveBeenCalledTimes(1);
    expect(createMsgMock).toHaveBeenCalledTimes(1);
    expect(convUpdateOneMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual({ conversation: fakeConv, message: fakeMsg });
  });
});
