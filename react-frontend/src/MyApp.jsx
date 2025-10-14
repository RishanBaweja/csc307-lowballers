// src/MyApp.jsx
import React, { useState, useEffect } from "react";
import Table from "./Table";
import Form from "./Form";

function MyApp() {
  const [characters, setCharacters] = useState([]);

  function removeOneCharacter(index) {
    const row = characters[index];
    const id = row._id ?? row.id;
    const promise = fetch(`http://localhost:8000/users/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.status === 204) {
        const updated = characters.filter((character, i) => {
          return i !== index;
        });
        setCharacters(updated);
      }
      // implement 404 once you know what it should do if user not found
    });

    return promise;
  }

  function fetchUsers() {
    const promise = fetch("http://localhost:8000/users");
    return promise;
  }

  useEffect(() => {
    fetchUsers()
      .then((res) => res.json())
      .then((json) => setCharacters(json["users_list"]))
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function postUser(person) {
    return fetch("http://localhost:8000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(person),
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to Post User");
      }
      return res.json();
    });
  }

  function updateList(person) {
    postUser(person)
      .then((data) => setCharacters((prev) => [...prev, data]))
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="container">
      <Table characterData={characters} removeCharacter={removeOneCharacter} />
      <Form handleSubmit={updateList} />
    </div>
  );
}
export default MyApp;
