import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [error, setError] = useState("");
  const [forgotError, setForgotError] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

  const [resetEmailSent, setResetEmailSent] = useState(false);

  // ============================================================
  // LOGIN INPUT
  // ============================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData,
      );

      const data = response.data;

      /*
       * Backend returns:
       *
       * token
       * message
       */

      if (!data.token) {
        setError(data.message || "Login failed.");

        return;
      }

      // Store JWT
      localStorage.setItem("token", data.token);

      // Store authentication state
      localStorage.setItem("isAuthenticated", "true");

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OPEN FORGOT PASSWORD
  // ============================================================

  const openForgotPassword = () => {
    setShowForgotPassword(true);

    setError("");
    setForgotError("");
    setResetEmailSent(false);

    setForgotEmail(formData.email || "");
  };

  // ============================================================
  // BACK TO LOGIN
  // ============================================================

  const backToLogin = () => {
    setShowForgotPassword(false);

    setForgotError("");
    setResetEmailSent(false);
  };

  // ============================================================
  // FORGOT PASSWORD EMAIL
  // ============================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setForgotError("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");

      return;
    }

    try {
      setForgotLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        {
          email: forgotEmail.trim(),
        },
      );

      /*
       * We intentionally show the same
       * success message whether the email
       * exists or not.
       */

      console.log(response.data);

      setResetEmailSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);

      setForgotError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD SCREEN
  // ============================================================

  if (showForgotPassword) {
    return (
      <div className="auth-page">
        <div className="auth-card forgot-password-card">
          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="auth-header">
            <div className="auth-logo">🔐</div>

            <h1>Family Tree Link</h1>

            <p>Reset your password and continue your family story.</p>
          </div>

          {!resetEmailSent ? (
            <>
              <h2>Forgot Password?</h2>

              <p className="auth-subtitle">
                Enter the email address associated with your account. We'll send
                you a secure password reset link.
              </p>

              {forgotError && <div className="auth-error">{forgotError}</div>}

              <form className="auth-form" onSubmit={handleForgotPassword}>
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);

                    setForgotError("");
                  }}
                  autoComplete="email"
                  autoFocus
                />

                <button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <button
                type="button"
                className="auth-back-button"
                onClick={backToLogin}
              >
                ← Back to Login
              </button>
            </>
          ) : (
            /* =================================================
               EMAIL SENT
               ================================================= */

            <div className="reset-email-success">
              <div className="success-icon">✓</div>

              <h2>Check Your Email</h2>

              <p>If an account exists for</p>

              <strong>{forgotEmail}</strong>

              <p>we've sent a secure link to reset your password.</p>

              <div className="reset-email-note">
                <span>💡</span>

                <p>
                  The reset link will expire in 15 minutes. If you don't see the
                  email, check your spam or junk folder.
                </p>
              </div>

              <button
                type="button"
                className="auth-back-button"
                onClick={backToLogin}
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // NORMAL LOGIN
  // ============================================================

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ==================================================
            HEADER
            ================================================== */}

        <div className="auth-header">
          <div className="auth-logo">🌳</div>

          <h1>Family Tree Link</h1>

          <p>
            Preserving Relationships. Protecting Memories. Connecting
            Generations.
          </p>
        </div>

        <h2>Welcome Back</h2>

        <p className="auth-subtitle">
          Sign in to access your family workspace.
        </p>

        {/* ==================================================
            ERROR
            ================================================== */}

        {error && <div className="auth-error">{error}</div>}

        {/* ==================================================
            LOGIN FORM
            ================================================== */}

        <form className="auth-form" onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {/* =================================================
              FORGOT PASSWORD
              ================================================= */}

          <div className="forgot-password-link-wrapper">
            <button
              type="button"
              className="forgot-password-link"
              onClick={openForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* ==================================================
            FOOTER
            ================================================== */}

        <div className="auth-footer">
          <span>Don't have an account?</span>

          <Link to="/register">Create Family</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
