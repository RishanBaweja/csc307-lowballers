import React, { useState, useEffect } from "react";
import style from "./navbar.module.css";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  /*
   * I moved all functions into Layout.jsx and got rid of MyApp.jsx
   * This will be how our pages look
   *
   */
  const [characters, setCharacters] = useState([]);

  function removeOneCharacter(index) {
    const row = characters[index];
    const id = row._id ?? row.id;
    const promise = fetch(`http://localhost:8000/users/${id}`, {
      method: "DELETE",
    }).then(res => {
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
      .then(res => res.json())
      .then(json => setCharacters(json["users_list"]))
      .catch(error => {
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
    }).then(res => {
      if (!res.ok) {
        throw new Error("Failed to Post User");
      }
      return res.json();
    });
  }

  function updateList(person) {
    postUser(person)
      .then(data => setCharacters(prev => [...prev, data]))
      .catch(error => {
        console.log(error);
      });
  }

  /*
   * This is our navbar, in order to add to it
   * Make a Link to and follow that format
   * Then go into main.jsx and add to the createBrowserRouter
   * to create the route to the page
   */
  return (
    <div className={style.shell}>
      <header className={style.navbar}>
        <h1 className={style.pagetitle}>Lowballers </h1>
        <nav className={style.navlist}>
          <Link to="/">Home</Link>
          <Link to="/inbox"> Inbox</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>
      <main className={style.content}>
        <Outlet context={{ characters, updateList, removeOneCharacter }} />
      </main>
    </div>
  );
}
