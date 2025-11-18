import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddingForm from "../AddingForm";

function AddItem() {
  const navigate = useNavigate();

  async function addItem(item) {
    try {
      const response = await fetch("http://localhost:8000/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
        credentials: "include",
      });

      if (response.ok) {
        const newItem = await response.json();
        navigate("/items"); // Redirect to items list
      } else {
        const error = await response.json();
        console.error("Failed to add item:", error);
        alert("Failed to add item: " + error.error);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item.");
    }
  }

  return (
    <div className="add-item-page">
      <h1>Add New Item</h1>
      <AddingForm handleSubmit={addItem} />
    </div>
  );
}

export default AddItem;
