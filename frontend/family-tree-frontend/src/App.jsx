import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useState } from "react";

import TreePage from "./pages/TreePage";
import MembersPage from "./pages/MembersPage";
import RelationshipsPage from "./pages/RelationshipsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import ReceivedInvitationsPage from "./pages/ReceivedInvitationsPage";
import FamilySetupPage from "./pages/FamilySetupPage";
import LandingPage from "./pages/LandingPage";
import TimelinePage from "./pages/TimelinePage";
import CreateFamilyPage from "./pages/CreateFamilyPage";
import DashboardPage from "./pages/DashboardPage";
import FamilyInvitationPage from "./pages/FamilyInvitationPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import GalleryPage from "./pages/GalleryPage";
import FamilySettingsPage from "./pages/FamilySettingsPage";
import InviteMemberPage from "./pages/InviteMemberPage";
import JoinFamilyPage from "./pages/JoinFamilyPage";

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

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/data-deletion" element={<DataDeletion />} />

          {/* ==========================================
              ROOT
          ========================================== */}

          <Route path="/" element={<LandingPage />} />

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
              <Route
                path="/family-setup"
                element={
                  <ProtectedRoute>
                    <FamilySetupPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/create-family" element={<CreateFamilyPage />} />

              <Route path="/family-invitations" element={<JoinFamilyPage />} />

              <Route
                path="/family-invitation"
                element={<FamilyInvitationPage />}
              />

              <Route
                path="/received-invitations"
                element={<ReceivedInvitationsPage />}
              />

              <Route path="/invite-member" element={<InviteMemberPage />} />

              <Route path="/tree" element={<TreePage />} />

              <Route path="/members" element={<MembersPage />} />

              <Route path="/member/:id" element={<MemberProfilePage />} />

              <Route path="/relationships" element={<RelationshipsPage />} />

              <Route path="/timeline" element={<TimelinePage />} />

              <Route path="/gallery" element={<GalleryPage />} />

              <Route path="/family-settings" element={<FamilySettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
