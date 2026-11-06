// ==============================================================================
// React Application Entry Point (main.jsx)
// ==============================================================================
// This file mounts our React component tree into the DOM (<div id="root"></div> in index.html).

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
