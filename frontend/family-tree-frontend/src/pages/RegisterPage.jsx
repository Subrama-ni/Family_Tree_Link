import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all fields.");

      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        formData,
      );

      const data = response.data;

      if (data.message === "Email already registered") {
        setError("This email is already registered.");

        return;
      }

      setSuccess(data.message || "Registration successful.");

      /*
       * Registration does not automatically
       * log the user in in our current backend.
       *
       * Redirect to login after a short delay.
       */

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌳</div>

          <h1>Family Tree Link</h1>

          <p>Create your digital family workspace.</p>
        </div>

        <h2>Create Your Family</h2>

        <p className="auth-subtitle">
          Start preserving your family's relationships and memories.
        </p>

        {error && <div className="auth-error">{error}</div>}

        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full Name</label>

          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
          />

          <label>Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Family"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>

          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
