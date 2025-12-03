import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../config";

export default function ConversationPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(
          `${API_BASE}/conversation/${conversationId}/messages`,
          { credentials: "include" }
        );
        if (!res.ok) {
          console.error("Failed to fetch messages");
          return;
        }
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE}/conversation/${conversationId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
      if (!res.ok) {
        console.error("Failed to send message");
        return;
      }
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]); // append
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  return (
    <div>
      <h2>Conversation With {conversationId}</h2>
      <div>
        {messages.map(m => (
          <div key={m._id}>
            <span>{m.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
