import React, { useState, useEffect } from "react";
import style from "./navbar.module.css";
import { Link } from "react-router-dom";

export default function Layout() {
  return (
    <header className={style.navbar}>
      <h1 className={style.pagetitle}>Lowballers </h1>
      <nav className={style.navlist}>
        <Link to="/form">Form</Link>
        <Link to="/table">Table</Link>
      </nav>
    </header>
  );
}
