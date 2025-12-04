// src/pages/Home.jsx
import React, { useContext } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import API_BASE from "../config.js";

export default function Home() {
  // You’re still getting these from Layout via Outlet,
  // but we no longer need to display the list of users here.
  const { characters, updateList, removeOneCharacter } = useOutletContext();
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    // Global LoginModal is already showing if not logged in,
    // so just keep the page content simple.
    return (
      <div style={{ padding: "1rem" }}>
        <h2>Welcome to Lowballers</h2>
        <p>Please log in or create an account to start sharing items.</p>
      </div>
    );
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  }

  return (
    <div className="container" style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>Welcome, {user.username}!</h3>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>What is Lowballers?</h2>
        <p style={{ maxWidth: "600px" }}>
          Lowballers is a community-driven platform for exchanging free items. 
          Users can post items they no longer need, browse listings from others, 
          and coordinate pick-ups through built-in messaging — no money involved, 
          just giving things a second life.
        </p>
      </section>

      <section>
        <h3>What you can do</h3>
        <ul>
          <li>Browse all available free items.</li>
          <li>List your own items for others to claim.</li>
          <li>Message other users to arrange pick-ups.</li>
        </ul>

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button onClick={() => navigate("/items")}>View Items</button>
          <button onClick={() => navigate("/add-item")}>Add an Item</button>
          <button onClick={() => navigate("/inbox")}>Go to Inbox</button>
        </div>
      </section>
    </div>
  );
}
