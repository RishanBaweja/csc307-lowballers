import React, { useState, useEffect } from "react";
import Table from "../Table.jsx";
import Form from "../Form.jsx";
import { useOutletContext } from "react-router-dom";
import API_BASE from "../config.js";

export default function Home() {
  const { characters, updateList, removeOneCharacter } = useOutletContext();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    const endpoint = isRegistering ? "register" : "login";
    const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //allows for cookies to be passed
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      alert(data.message || "An error occurred");
    }
  }

  //Automatically check if user is still logged in
  useEffect(() => {
    fetch(`${API_BASE}/auth/verify`, {
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        if (data.loggedIn) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      });
  }, []);

  //IF Not logged in, show login/register form to the user
  if (!user) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button onClick={handleSubmit}>
          {isRegistering ? "Register" : "Login"}
        </button>
        <button onClick={() => setIsRegistering(prev => !prev)}>
          {isRegistering ? "Switch to Login" : "Switch to Register"}
        </button>
      </div>
    );
  }

  //If logged in, show the main app
  return (
    <div className="container" style={{ padding: "1rem" }}>
      <h3>Welcome, {user.username}!</h3>
      <button
        onClick={async () => {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
          setUser(null);
          localStorage.removeItem("user");
        }}
      >
        Logout
      </button>
      <h4>All Users</h4>
      <Table characterData={characters} removeCharacter={removeOneCharacter} />
    </div>
  );
}
