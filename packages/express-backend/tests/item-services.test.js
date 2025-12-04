import { jest } from "@jest/globals";
import itemServices from "../item-services.js";
import { Item } from "../db-schema.js";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("item-services: basic CRUD + mapper", () => {
  test("getItems calls Item.find", async () => {
    const fakeItems = [{ itemName: "Table" }];
    const findMock = jest.spyOn(Item, "find").mockResolvedValue(fakeItems);

    const result = await itemServices.getItems();

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeItems);
  });

  test("findItemById calls Item.findById().populate('userID')", async () => {
    const query = { populate: jest.fn().mockResolvedValue({ _id: "i1" }) };
    const findByIdMock = jest.spyOn(Item, "findById").mockReturnValue(query);

    const result = await itemServices.findItemById("i1");

    expect(findByIdMock).toHaveBeenCalledWith("i1");
    expect(query.populate).toHaveBeenCalledWith("userID");
    expect(result).toEqual({ _id: "i1" });
  });

  test("addItem saves new Item", async () => {
    const fakeItem = { _id: "i1", itemName: "Lamp" };
    const saveMock = jest
      .spyOn(Item.prototype, "save")
      .mockResolvedValue(fakeItem);

    const result = await itemServices.addItem({ itemName: "Lamp", amount: 1 });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeItem);
  });

  test("deleteItem calls Item.findByIdAndDelete", async () => {
    const fakeItem = { _id: "i1" };
    const deleteMock = jest
      .spyOn(Item, "findByIdAndDelete")
      .mockResolvedValue(fakeItem);

    const result = await itemServices.deleteItem("i1");

    expect(deleteMock).toHaveBeenCalledWith("i1");
    expect(result).toBe(fakeItem);
  });

  test("mapItemToResponse maps fields correctly", () => {
    const mongoItem = {
      _id: "i1",
      userID: "u1",
      itemName: "Chair",
      description: "Comfy",
      location: "SLO",
      amount: 1,
      genre: "furniture",
      image: "http://img",
    };

    const mapped = itemServices.mapItemToResponse(mongoItem);

    expect(mapped).toEqual({
      id: "i1",
      userId: "u1",
      name: "Chair",
      description: "Comfy",
      location: "SLO",
      amount: 1,
      genre: "furniture",
      image: "http://img",
    });
  });
});

describe("item-services: extra query helpers", () => {
  test("getItemsByUserId filters by userID", async () => {
    const fakeItems = [{ _id: "i1", userID: "u1" }];
    const findMock = jest.spyOn(Item, "find").mockResolvedValue(fakeItems);

    const result = await itemServices.getItemsByUserId("u1");

    expect(findMock).toHaveBeenCalledWith({ userID: "u1" });
    expect(result).toBe(fakeItems);
  });

  test("searchItemsByName uses regex and populates userID", async () => {
    const fakeItems = [{ _id: "i1" }];
    const query = {
      populate: jest.fn().mockResolvedValue(fakeItems),
    };
    const findMock = jest.spyOn(Item, "find").mockReturnValue(query);

    const result = await itemServices.searchItemsByName("chair");

    expect(findMock).toHaveBeenCalledTimes(1);
    // We don't assert on the exact regex, just that populate is called
    expect(query.populate).toHaveBeenCalledWith("userID");
    expect(result).toBe(fakeItems);
  });

  test("getItemsByLocation filters by location and populates userID", async () => {
    const fakeItems = [{ _id: "i1", location: "SLO" }];
    const query = {
      populate: jest.fn().mockResolvedValue(fakeItems),
    };
    const findMock = jest.spyOn(Item, "find").mockReturnValue(query);

    const result = await itemServices.getItemsByLocation("SLO");

    expect(findMock).toHaveBeenCalledWith({ location: "SLO" });
    expect(query.populate).toHaveBeenCalledWith("userID");
    expect(result).toBe(fakeItems);
  });

  test("searchItemsWithLocationFilter combines search term and location and populates userID", async () => {
    const fakeItems = [{ _id: "i1", location: "SLO" }];
    const query = {
      populate: jest.fn().mockResolvedValue(fakeItems),
    };
    const findMock = jest.spyOn(Item, "find").mockReturnValue(query);

    const result = await itemServices.searchItemsWithLocationFilter(
      "chair",
      "SLO"
    );

    expect(findMock).toHaveBeenCalledTimes(1);
    // Again, we don't assert on regex details – just that populate is used
    expect(query.populate).toHaveBeenCalledWith("userID");
    expect(result).toBe(fakeItems);
  });
});
