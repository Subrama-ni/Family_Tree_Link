import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useState } from "react";

import TreePage from "./pages/TreePage";
import MembersPage from "./pages/MembersPage";
import RelationshipsPage from "./pages/RelationshipsPage";
import TimelinePage from "./pages/TimelinePage";
import DashboardPage from "./pages/DashboardPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import GalleryPage from "./pages/GalleryPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";
import RootRedirect from "./components/RootRedirect";
import ResetPassword from "./pages/ResetPassword";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <div className={darkMode ? "app-container dark" : "app-container"}>
        <Routes>
          {/* ==========================================
              PUBLIC
          ========================================== */}

          <Route path="/login" element={<LoginPage />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/register" element={<RegisterPage />} />

          {/* ==========================================
              ROOT REDIRECT
          ========================================== */}

          <Route path="/" element={<RootRedirect />} />

          {/* ==========================================
              AUTHENTICATED APPLICATION
          ========================================== */}

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <ProtectedLayout
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/tree" element={<TreePage />} />

              <Route path="/members" element={<MembersPage />} />

              <Route path="/member/:id" element={<MemberProfilePage />} />

              <Route path="/relationships" element={<RelationshipsPage />} />

              <Route path="/timeline" element={<TimelinePage />} />

              <Route path="/gallery" element={<GalleryPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
