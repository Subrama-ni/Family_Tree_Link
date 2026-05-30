import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useState } from "react";

import Navbar from "./components/Navbar";

import TreePage from "./pages/TreePage";

import MembersPage from "./pages/MembersPage";

import RelationshipsPage from "./pages/RelationshipsPage";

import TimelinePage from "./pages/TimelinePage";
import DashboardPage from "./pages/DashboardPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import GalleryPage from "./pages/GalleryPage";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <div className={darkMode ? "app-container dark" : "app-container"}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <Routes>
          <Route path="/" element={<TreePage />} />
          <Route path="/gallery" element={<GalleryPage />} />

          <Route path="/members" element={<MembersPage />} />

          <Route path="/relationships" element={<RelationshipsPage />} />

          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/member/:id" element={<MemberProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
