import { jest } from "@jest/globals";
import itemServices from "../item-services.js";
import { Item } from "../db-schema.js";

afterEach(() => {
  jest.restoreAllMocks();
});

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
    image: "http://img"
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
    image: "http://img"
  });
});
