import { jest } from "@jest/globals";
import db from "../db-services.js";
import { User, Item, Catalog, Message, Conversation } from "../db-schema.js";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("db-services: User functions", () => {
  test("addUser saves a new User document", async () => {
    const fakeUser = { _id: "123", username: "alice" };
    const saveMock = jest
      .spyOn(User.prototype, "save")
      .mockResolvedValue(fakeUser);

    const data = { username: "alice", password: "secret" };
    const result = await db.addUser(data);

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeUser);
  });

  test("getUsers calls User.find and returns result", async () => {
    const fakeUsers = [{ username: "a" }, { username: "b" }];
    const findMock = jest.spyOn(User, "find").mockResolvedValue(fakeUsers);

    const result = await db.getUsers();

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeUsers);
  });

  test("findUserById calls User.findById", async () => {
    const fakeUser = { _id: "123", username: "alice" };
    const findByIdMock = jest
      .spyOn(User, "findById")
      .mockResolvedValue(fakeUser);

    const result = await db.findUserById("123");

    expect(findByIdMock).toHaveBeenCalledWith("123");
    expect(result).toBe(fakeUser);
  });

  test("deleteUser calls User.findByIdAndDelete", async () => {
    const deleted = { _id: "123" };
    const deleteMock = jest
      .spyOn(User, "findByIdAndDelete")
      .mockResolvedValue(deleted);

    const result = await db.deleteUser("123");

    expect(deleteMock).toHaveBeenCalledWith("123");
    expect(result).toBe(deleted);
  });
});

describe("db-services: Item functions", () => {
  test("addItem saves a new Item", async () => {
    const fakeItem = { _id: "i1", itemName: "Chair" };
    const saveMock = jest
      .spyOn(Item.prototype, "save")
      .mockResolvedValue(fakeItem);

    const result = await db.addItem({ itemName: "Chair", amount: 1 });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeItem);
  });

  test("getItems calls Item.find", async () => {
    const fakeItems = [{ itemName: "Chair" }];
    const findMock = jest.spyOn(Item, "find").mockResolvedValue(fakeItems);

    const result = await db.getItems();
    expect(findMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeItems);
  });

  test("findItemById populates userID", async () => {
    const query = {
      populate: jest.fn().mockResolvedValue({ _id: "i1" })
    };
    const findByIdMock = jest.spyOn(Item, "findById").mockReturnValue(query);

    const result = await db.findItemById("i1");

    expect(findByIdMock).toHaveBeenCalledWith("i1");
    expect(query.populate).toHaveBeenCalledWith("userID");
    expect(result).toEqual({ _id: "i1" });
  });

  test("deleteItem calls Item.findByIdAndDelete", async () => {
    const fakeItem = { _id: "i1" };
    const deleteMock = jest
      .spyOn(Item, "findByIdAndDelete")
      .mockResolvedValue(fakeItem);

    const result = await db.deleteItem("i1");

    expect(deleteMock).toHaveBeenCalledWith("i1");
    expect(result).toBe(fakeItem);
  });
});

describe("db-services: Catalog + Message functions", () => {
  test("addCatalogEntry saves Catalog", async () => {
    const fakeCatalog = { _id: "c1" };
    const saveMock = jest
      // @ts-ignore – Catalog is a model, we just need its prototype
      .spyOn(Catalog.prototype, "save")
      .mockResolvedValue(fakeCatalog);

    const result = await db.addCatalogEntry({ itemID: "i1", userID: "u1" });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeCatalog);
  });

  test("getCatalogEntries calls Catalog.find().populate()", async () => {
    const fakeDocs = [{}, {}];
    const query = {
      populate: jest.fn().mockResolvedValue(fakeDocs)
    };
    const findMock = jest.spyOn(Catalog, "find").mockReturnValue(query);

    const result = await db.getCatalogEntries();

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(query.populate).toHaveBeenCalledWith(["itemID", "userID"]);
    expect(result).toBe(fakeDocs);
  });

  test("addMessage saves Message", async () => {
    const fakeMsg = { _id: "m1", text: "hi" };
    const saveMock = jest
      .spyOn(Message.prototype, "save")
      .mockResolvedValue(fakeMsg);

    const result = await db.addMessage({ text: "hi" });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeMsg);
  });

  test("getMessages calls Message.find().populate()", async () => {
    const fakeMsgs = [{}, {}];
    const query = {
      populate: jest.fn().mockResolvedValue(fakeMsgs)
    };
    const findMock = jest.spyOn(Message, "find").mockReturnValue(query);

    const result = await db.getMessages();

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(query.populate).toHaveBeenCalledWith(["buyerID", "itemID"]);
    expect(result).toBe(fakeMsgs);
  });
});

describe("db-services: Conversation functions", () => {
  test("findConversationById calls Conversation.findById and returns result", async () => {
    const fakeConv = { _id: "c1" };
    const findByIdMock = jest
      .spyOn(Conversation, "findById")
      .mockResolvedValue(fakeConv);

    const result = await db.findConversationById("c1");

    expect(findByIdMock).toHaveBeenCalledWith("c1");
    expect(result).toBe(fakeConv);
  });
});
