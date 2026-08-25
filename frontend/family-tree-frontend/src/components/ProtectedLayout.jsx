import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";

function ProtectedLayout({ darkMode, setDarkMode }) {
  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <Outlet />
    </>
  );
}

export default ProtectedLayout;
