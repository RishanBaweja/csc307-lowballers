import React, { useState, useEffect } from "react";
import style from "./navbar.module.css";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className={style.shell}>
      <header className={style.navbar}>
        <h1 className={style.pagetitle}>Lowballers </h1>
        <nav className={style.navlist}>
          <Link to="/form">Form</Link>
        </nav>
      </header>
      <main className={style.content}>
        <Outlet />
      </main>
    </div>
  );
}
