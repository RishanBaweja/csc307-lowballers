import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ItemTable from "../ItemTable";
import API_BASE from "../config";

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  // Fetch items from backend on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const response = await fetch(`${API_BASE}/conversation`, {
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to fetch conversations");
        return;
      }
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  async function removeItem(index) {
    const itemToDelete = items[index];
    try {
      const response = await fetch(`${API_BASE}/items/${itemToDelete.id}`, {
        method: "DELETE",
      });

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
    <div>
      <h1>Inbox</h1>
      {conversations.map(conv => (
        <div
          key={conv._id}
          onClick={() => navigate(`/conversation/${conv._id}`)}
        >
          <p>
            <strong>Preview:</strong>{" "}
            {conv.lastMessage?.preview ?? "(no messages)"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Inbox;
