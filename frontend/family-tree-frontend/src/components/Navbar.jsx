import { Link } from "react-router-dom";

function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <div className="logo">🌳 Family Tree Link</div>

      <div className="nav-links">
        <Link to="/">Tree</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/gallery">Gallery</Link>

        <Link to="/members">Members</Link>

        <Link to="/relationships">Relationships</Link>

        <Link to="/timeline">Timeline</Link>
      </div>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>
    </nav>
  );
}

export default Navbar;
