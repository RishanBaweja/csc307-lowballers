import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../config";

export default function ConversationPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  async function fetchMessages() {
    const res = await fetch(
      `${API_BASE}/conversation/${conversationId}/messages`,
      { credentials: "include" }
    );
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data);
  }

  async function fetchOtherUser() {
    const res = await fetch(
      `${API_BASE}/conversation/${conversationId}/other-user`,
      { credentials: "include" }
    );
    if (!res.ok) return;
    const data = await res.json();
    setOtherUser(data);
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchOtherUser();
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
      await res.json();
      setText("");
      await fetchMessages(); // Refresh messages to get populated sender info
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  return (
    <div>
      <h2>
        Conversation with{" "}
        {otherUser ? otherUser.displayName || otherUser.username : "Loading..."}
      </h2>

      <div>
        {messages.map(m => {
          // senderId is a populated user object because of .populate("senderId", ...)
          const sender = m.senderId;
          const name =
            sender?.displayName || sender?.username || "Unknown user";

          return (
            <div key={m._id}>
              <strong>{name}:</strong> <span>{m.text}</span>
            </div>
          );
        })}
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
