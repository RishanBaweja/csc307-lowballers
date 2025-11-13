import React, { useState } from "react";
import AddingForm from "../AddingForm";
import ItemTable from "../ItemTable";

function Items() {
  const [items, setItems] = useState([]);

  function addItem(item) {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    setItems([...items, newItem]);
  }

  function removeItem(index) {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  }

  return (
    <div className="items-page">
      <h1>Add New Item</h1>
      <AddingForm handleSubmit={addItem} />
      
      <h2>Your Items</h2>
      <ItemTable items={items} removeItem={removeItem} />
    </div>
  );
}

export default Items;
