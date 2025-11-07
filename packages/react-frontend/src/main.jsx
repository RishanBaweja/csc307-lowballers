// src/main.jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";

import MyApp from "./MyApp";
import Form from "./pages/Form.jsx";
// import Table from "./pages/Table.jsx";
import Layout from "./Layout.jsx";
// import Home from "./pages/Home.jsx";
import "./main.css";

// If network connectivity issues, no defined route, user error, etc.
function RouteError() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Oopsy Daisy</h1>
      <p>Something went wrong loading this page.</p>
    </div>
  );
}

/*
 * This function creates the browswer routing between pages.
 * MyApp page is current layout (element), however this should later be changed to be some sort of Layout.jsx
 * Layout.jsx should be footer, header, navbar, etc. and will be the standard for all pages
 * errorElement goes to our above RouteError function
 * In children is our pages
 * Currently, Home is our root page. This can be changed later, depending on if we want login
 * In order to add a new page, add a new bracket and follow same formatting. Make sure to import the page.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <div>Welcome home!</div> },
      { path: "form", element: <Form /> },
    ],
  },
]);

ReactDOMClient.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
