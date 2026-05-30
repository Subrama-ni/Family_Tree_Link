import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";

import MemberProfile from "./pages/MemberProfile";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/member/:id" element={<MemberProfile />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
