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
  const [showPassword, setShowPassword] = useState(false);

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
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData,
      );

      const data = response.data;

      if (!data.token) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
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
  // FORGOT PASSWORD
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
        <div className="auth-background">
          <span className="auth-orb auth-orb-one"></span>
          <span className="auth-orb auth-orb-two"></span>
          <span className="auth-orb auth-orb-three"></span>

          <div className="auth-grid"></div>
        </div>

        <div className="auth-shell auth-forgot-shell">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <span>FT</span>
            </div>

            <div>
              <strong>Family Tree Link</strong>
              <span>Preserve what connects you</span>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <span className="auth-eyebrow">ACCOUNT RECOVERY</span>

              <h1>Reset your password.</h1>

              <p>
                Enter the email connected to your account and we'll send you a
                secure password reset link.
              </p>
            </div>

            {!resetEmailSent ? (
              <form className="auth-form" onSubmit={handleForgotPassword}>
                {forgotError && (
                  <div className="auth-message auth-message-error">
                    <span>!</span>
                    {forgotError}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="forgot-email">Email address</label>

                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">@</span>

                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotError("");
                      }}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-button"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <span className="auth-spinner"></span>
                      Sending link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <span>→</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={backToLogin}
                >
                  ← Back to login
                </button>
              </form>
            ) : (
              <div className="auth-success-state">
                <div className="auth-success-icon">✓</div>

                <span className="auth-eyebrow">EMAIL SENT</span>

                <h2>Check your inbox.</h2>

                <p>
                  If an account exists for <strong>{forgotEmail}</strong>, we've
                  sent a secure password reset link.
                </p>

                <div className="auth-info-box">
                  <span>i</span>

                  <p>
                    The reset link expires in 15 minutes. Check your spam or
                    junk folder if you don't see it.
                  </p>
                </div>

                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={backToLogin}
                >
                  ← Back to login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NORMAL LOGIN
  // ============================================================

  return (
    <div className="auth-page">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="auth-background">
        <span className="auth-orb auth-orb-one"></span>
        <span className="auth-orb auth-orb-two"></span>
        <span className="auth-orb auth-orb-three"></span>

        <div className="auth-grid"></div>

        <div className="auth-branch auth-branch-one">⌁</div>
        <div className="auth-branch auth-branch-two">⌁</div>
      </div>

      {/* ======================================================
          AUTH SHELL
      ====================================================== */}

      <div className="auth-shell">
        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="auth-brand">
          <div className="auth-brand-mark">
            <span>FT</span>
          </div>

          <div>
            <strong>Family Tree Link</strong>
            <span>Preserve what connects you</span>
          </div>
        </div>

        {/* ====================================================
            CARD
        ==================================================== */}

        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-eyebrow">WELCOME BACK</span>

            <h1>Continue your family story.</h1>

            <p>
              Sign in to reconnect with your family, memories and generations.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              <span>!</span>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">@</span>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>

                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={openForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">●</span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="auth-divider">
            <span>New to Family Tree Link?</span>
          </div>

          {/* REGISTER */}

          <Link
            to="/register"
            className="auth-secondary-button auth-register-link"
          >
            Create your family space
            <span>→</span>
          </Link>
        </div>

        {/* ====================================================
            TRUST MESSAGE
        ==================================================== */}

        <div className="auth-trust">
          <span className="auth-trust-icon">◇</span>

          <span>
            Your family data stays private and belongs to your family.
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
