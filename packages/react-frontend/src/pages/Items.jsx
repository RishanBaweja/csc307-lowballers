import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ItemTable from "../ItemTable";
import API_BASE from "../config";

function Items() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // Fetch items from backend on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await fetch(`${API_BASE}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items_list || []);
      } else {
        console.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  async function removeItem(index) {
    const itemToDelete = items[index];
    try {
      const response = await fetch(
        `${API_BASE}/items/${itemToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
      } else {
        console.error("Failed to delete item");
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Make sure the backend is running.");
    }
  }

  return (
    <div className="items-page">
      <h1>All Items</h1>
      <button onClick={() => navigate("/add-item")}>Add New Item</button>
      <ItemTable items={items} removeItem={removeItem} />
    </div>
  );
}

export default Items;
