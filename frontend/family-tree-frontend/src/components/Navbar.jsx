import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../services/api";

function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState(0);

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * ============================================================
   * CLOSE MOBILE MENU
   * ============================================================
   */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /*
   * ============================================================
   * NAVIGATION ITEMS
   * ============================================================
   */

  const navItems = [
    {
      path: "/tree",
      label: "Tree",
      icon: "🌳",
    },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "✦",
    },
    {
      path: "/gallery",
      label: "Gallery",
      icon: "▣",
    },
    {
      path: "/members",
      label: "Members",
      icon: "♧",
    },
    {
      path: "/relationships",
      label: "Relationships",
      icon: "∞",
    },
    {
      path: "/timeline",
      label: "Timeline",
      icon: "◷",
    },
    {
      path: "/invite-member",
      label: "Invite",
      icon: "✉",
    },
    {
      path: "/family-settings",
      label: "Settings",
      icon: "⚙",
    },
  ];

  /*
   * ============================================================
   * LOAD PENDING INVITATIONS
   * ============================================================
   */

  const loadPendingInvitations = async () => {
    try {
      const response = await api.get("/api/families/received-invitations");

      const receivedInvitations = Array.isArray(response.data)
        ? response.data
        : [];

      const pendingCount = receivedInvitations.filter(
        (invitation) =>
          String(invitation.status || "").toUpperCase() === "PENDING",
      ).length;

      setPendingInvitations(pendingCount);
    } catch (error) {
      console.debug("Unable to load invitation notification count.");

      setPendingInvitations(0);
    }
  };

  /*
   * ============================================================
   * INITIAL LOAD + POLLING
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) {
        return;
      }

      await loadPendingInvitations();
    };

    load();

    const interval = window.setInterval(() => {
      load();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  /*
   * ============================================================
   * INVITATION BUTTON
   * ============================================================
   */

  const handleInvitationClick = () => {
    navigate("/received-invitations");
    closeMenu();
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <header className="cinematic-navbar-wrapper">
      <nav className="cinematic-navbar">
        {/* ======================================================
            LOGO
        ======================================================= */}

        <div
          className="cinematic-logo"
          onClick={() => navigate("/dashboard")}
          style={{
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <div className="logo-tree-orbit">
            <span className="logo-tree">🌳</span>

            <span className="logo-orbit orbit-one"></span>

            <span className="logo-orbit orbit-two"></span>
          </div>

          <div className="logo-text">
            <span className="logo-family">Family</span>

            <span className="logo-tree-text">Tree</span>

            <span className="logo-link-text">Link</span>
          </div>
        </div>

        {/* ======================================================
            DESKTOP NAVIGATION
        ======================================================= */}

        <div
          className="cinematic-nav-links"
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            display: "flex",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `cinematic-nav-item ${isActive ? "cinematic-nav-active" : ""}`
              }
              style={{
                paddingLeft: "6px",
                paddingRight: "6px",
                gap: "4px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                flexShrink: 1,
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>

              <span className="nav-item-label">{item.label}</span>

              <span className="nav-active-line"></span>
            </NavLink>
          ))}
        </div>

        {/* ======================================================
            RIGHT-SIDE ACTIONS
        ======================================================= */}

        <div
          className="cinematic-navbar-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            flexShrink: 0,
            marginLeft: "4px",
          }}
        >
          {/* ----------------------------------------------------
              INVITATIONS
          ----------------------------------------------------- */}

          <button
            type="button"
            onClick={handleInvitationClick}
            title={
              pendingInvitations > 0
                ? `${pendingInvitations} pending family invitation${
                    pendingInvitations === 1 ? "" : "s"
                  }`
                : "Family invitations"
            }
            aria-label="Family invitations"
            style={{
              position: "relative",
              width: "42px",
              minWidth: "42px",
              height: "42px",
              padding: 0,
              borderRadius: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "19px",
                lineHeight: 1,
              }}
            >
              💌
            </span>

            {pendingInvitations > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  borderRadius: "999px",
                  background: "#c87942",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: 800,
                  lineHeight: "18px",
                  textAlign: "center",
                  border: "2px solid #ffffff",
                  boxSizing: "border-box",
                }}
              >
                {pendingInvitations > 99 ? "99+" : pendingInvitations}
              </span>
            )}
          </button>

          {/* ----------------------------------------------------
              THEME
          ----------------------------------------------------- */}

          <button
            type="button"
            className="cinematic-theme-button"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              flexShrink: 0,
              minWidth: "42px",
              width: "42px",
              padding: 0,
              justifyContent: "center",
            }}
          >
            <span className="theme-icon">{darkMode ? "☀" : "☾"}</span>

            <span
              className="theme-label"
              style={{
                display: "none",
              }}
            >
              {darkMode ? "Light" : "Dark"}
            </span>
          </button>

          {/* ----------------------------------------------------
              LOGOUT
          ----------------------------------------------------- */}

          <button
            type="button"
            className="cinematic-logout-button"
            onClick={handleLogout}
            style={{
              minWidth: "72px",
              paddingLeft: "10px",
              paddingRight: "10px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <span>Logout</span>

            <span className="logout-arrow">↗</span>
          </button>
        </div>

        {/* ======================================================
            MOBILE MENU BUTTON
        ======================================================= */}

        <button
          type="button"
          className={`cinematic-menu-button ${menuOpen ? "menu-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* ========================================================
          MOBILE MENU
      ========================================================= */}

      <div
        className={`cinematic-mobile-menu ${
          menuOpen ? "mobile-menu-visible" : ""
        }`}
      >
        <div className="mobile-menu-inner">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? "mobile-nav-active" : ""}`
              }
            >
              <span className="mobile-nav-icon">{item.icon}</span>

              <span>{item.label}</span>

              <span className="mobile-nav-arrow">→</span>
            </NavLink>
          ))}

          {/* ----------------------------------------------------
              MOBILE INVITATIONS
          ----------------------------------------------------- */}

          <button
            type="button"
            className="mobile-theme-button"
            onClick={handleInvitationClick}
            style={{
              position: "relative",
            }}
          >
            <span>💌</span>

            <span>Family Invitations</span>

            {pendingInvitations > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  minWidth: "22px",
                  height: "22px",
                  padding: "0 5px",
                  borderRadius: "999px",
                  background: "#c87942",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 800,
                  lineHeight: "22px",
                  textAlign: "center",
                }}
              >
                {pendingInvitations > 99 ? "99+" : pendingInvitations}
              </span>
            )}
          </button>

          <div className="mobile-menu-divider"></div>

          {/* ----------------------------------------------------
              MOBILE THEME
          ----------------------------------------------------- */}

          <button
            type="button"
            className="mobile-theme-button"
            onClick={() => {
              setDarkMode(!darkMode);
              closeMenu();
            }}
          >
            <span>{darkMode ? "☀" : "☾"}</span>

            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>

          {/* ----------------------------------------------------
              MOBILE LOGOUT
          ----------------------------------------------------- */}

          <button
            type="button"
            className="mobile-logout-button"
            onClick={handleLogout}
          >
            Logout
            <span>↗</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
