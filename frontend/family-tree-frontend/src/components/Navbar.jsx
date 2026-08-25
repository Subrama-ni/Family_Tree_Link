import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");

    navigate("/login", { replace: true });
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

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
  ];

  return (
    <header className="cinematic-navbar-wrapper">
      <nav className="cinematic-navbar">
        {/* ==================================================
            LOGO
        ================================================== */}

        <div className="cinematic-logo" onClick={() => navigate("/dashboard")}>
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

        {/* ==================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <div className="cinematic-nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `cinematic-nav-item ${isActive ? "cinematic-nav-active" : ""}`
              }
            >
              <span className="nav-item-icon">{item.icon}</span>

              <span className="nav-item-label">{item.label}</span>

              <span className="nav-active-line"></span>
            </NavLink>
          ))}
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="cinematic-navbar-actions">
          <button
            className="cinematic-theme-button"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="theme-icon">{darkMode ? "☀" : "☾"}</span>

            <span className="theme-label">{darkMode ? "Light" : "Dark"}</span>
          </button>

          <button className="cinematic-logout-button" onClick={handleLogout}>
            <span>Logout</span>

            <span className="logout-arrow">↗</span>
          </button>
        </div>

        {/* ==================================================
            MOBILE MENU BUTTON
        ================================================== */}

        <button
          className={`cinematic-menu-button ${menuOpen ? "menu-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* ====================================================
          MOBILE NAVIGATION
      ==================================================== */}

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

          <div className="mobile-menu-divider"></div>

          <button
            className="mobile-theme-button"
            onClick={() => {
              setDarkMode(!darkMode);
              closeMenu();
            }}
          >
            <span>{darkMode ? "☀" : "☾"}</span>

            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>

          <button className="mobile-logout-button" onClick={handleLogout}>
            Logout
            <span>↗</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
