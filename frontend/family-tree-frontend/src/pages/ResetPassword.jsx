import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  // ============================================================
  // INPUT
  // ============================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid or missing password reset link.");

      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Please enter your new password.");

      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");

      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        {
          token,
          newPassword: formData.password,
        },
      );

      console.log(response.data);

      setSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to reset your password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS
  // ============================================================

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🌳</div>

            <h1>Family Tree Link</h1>

            <p>Your family story is waiting for you.</p>
          </div>

          <div className="reset-email-success">
            <div className="success-icon">✓</div>

            <h2>Password Reset!</h2>

            <p>Your password has been successfully updated.</p>

            <p>You can now sign in using your new password.</p>

            <button type="button" onClick={() => navigate("/login")}>
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>

          <h1>Family Tree Link</h1>

          <p>Create a new password and protect your family workspace.</p>
        </div>

        <h2>Create New Password</h2>

        <p className="auth-subtitle">
          Choose a strong password for your account.
        </p>

        {!token && (
          <div className="auth-error">
            Invalid or missing password reset link.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>New Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={!token}
          />

          <label>Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={!token}
          />

          <div className="password-hint">
            Password must contain at least 6 characters.
          </div>

          <button type="submit" disabled={loading || !token}>
            {loading ? "Updating Password..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="auth-back-button"
            onClick={() => navigate("/login")}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
