import { Navigate } from "react-router-dom";

function RootRedirect() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default RootRedirect;
