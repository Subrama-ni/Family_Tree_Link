import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../services/api";

function FamilyInvitationPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [accepting, setAccepting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * ============================================================
   * LOAD INVITATION
   * ============================================================
   */

  useEffect(() => {
    if (!token) {
      setError("This invitation link is missing a valid invitation token.");

      setLoading(false);

      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await api.get(
        `/api/families/invitations/token/${encodeURIComponent(token)}`,
      );

      setInvitation(response.data);
    } catch (error) {
      console.error("Load invitation error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        setError(
          "Please log in using the email address that received this invitation.",
        );
      } else {
        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "This invitation is invalid or has expired.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * ACCEPT INVITATION
   * ============================================================
   */

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError("Invalid invitation token.");

      return;
    }

    try {
      setAccepting(true);

      setError("");

      setSuccess("");

      const response = await api.post(
        `/api/families/invitations/token/${encodeURIComponent(token)}/accept`,
      );

      setSuccess("You have successfully joined the family!");

      setInvitation(response.data);

      /*
       * The JWT that was created before joining the
       * family does not contain the newly assigned
       * family ID.
       *
       * So after accepting, send the user to login
       * again so a fresh JWT can be generated.
       */

      setTimeout(() => {
        localStorage.removeItem("token");

        localStorage.removeItem("isAuthenticated");

        navigate("/login", {
          replace: true,

          state: {
            message:
              "You joined the family successfully. Please sign in again.",
          },
        });
      }, 1800);
    } catch (error) {
      console.error("Accept invitation error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to accept this invitation.",
      );
    } finally {
      setAccepting(false);
    }
  };

  /*
   * ============================================================
   * GO TO LOGIN
   * ============================================================
   */

  const handleLogin = () => {
    navigate("/login", {
      state: {
        invitationToken: token,
      },
    });
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="family-invitation-page">
        <div className="family-invitation-card">
          <div className="family-invitation-icon">🌳</div>

          <div className="family-invitation-spinner">🌿</div>

          <h1>Checking your invitation...</h1>

          <p>Please wait while we retrieve your family invitation.</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error && !invitation) {
    return (
      <div className="family-invitation-page">
        <div className="family-invitation-card">
          <div className="family-invitation-icon error">⚠️</div>

          <span className="family-invitation-kicker">FAMILY TREE LINK</span>

          <h1>Invitation unavailable</h1>

          <p className="family-invitation-message">{error}</p>

          {token && (
            <button
              type="button"
              className="family-invitation-primary-button"
              onClick={handleLogin}
            >
              Log In to Continue
              <span>→</span>
            </button>
          )}

          <button
            type="button"
            className="family-invitation-secondary-button"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN PAGE
   * ============================================================
   */

  const family = invitation?.family;

  const familyName = family?.name || "Your Family";

  const inviterName =
    invitation?.invitedBy?.fullName ||
    invitation?.invitedBy?.name ||
    "A family member";

  const invitedEmail = invitation?.invitedEmail || "";

  const status = invitation?.status || "PENDING";

  /*
   * ============================================================
   * ALREADY ACCEPTED
   * ============================================================
   */

  const alreadyAccepted = status === "ACCEPTED";

  const expired = status === "EXPIRED";

  return (
    <div className="family-invitation-page">
      {/* ======================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div className="family-invitation-background">
        <span className="invitation-leaf leaf-1">🍃</span>

        <span className="invitation-leaf leaf-2">🍂</span>

        <span className="invitation-leaf leaf-3">🍃</span>

        <span className="invitation-leaf leaf-4">🍃</span>
      </div>

      {/* ======================================================
          CARD
      ====================================================== */}

      <main className="family-invitation-card">
        <div className="family-invitation-icon">🌳</div>

        <span className="family-invitation-kicker">FAMILY TREE LINK</span>

        <h1>You're invited!</h1>

        <p className="family-invitation-message">
          <strong>{inviterName}</strong> has invited you to become part of their
          family story.
        </p>

        {/* ====================================================
            FAMILY
        ==================================================== */}

        <div className="invited-family-card">
          <div className="invited-family-tree">🌳</div>

          <div>
            <span>YOU'RE JOINING</span>

            <h2>{familyName}</h2>
          </div>
        </div>

        {/* ====================================================
            EMAIL
        ==================================================== */}

        {invitedEmail && (
          <div className="invited-email">
            <span>✉</span>

            <div>
              <small>INVITATION SENT TO</small>

              <strong>{invitedEmail}</strong>
            </div>
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div className="family-invitation-success">🎉 {success}</div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && <div className="family-invitation-error">⚠️ {error}</div>}

        {/* ====================================================
            EXPIRED
        ==================================================== */}

        {expired ? (
          <div className="invitation-unavailable-box">
            <strong>This invitation has expired.</strong>

            <p>Ask a family member to send you a new invitation.</p>
          </div>
        ) : alreadyAccepted ? (
          <div className="invitation-accepted-box">
            <div>✓</div>

            <strong>Invitation already accepted</strong>

            <p>You have already joined this family.</p>

            <button
              type="button"
              className="family-invitation-primary-button"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
              <span>→</span>
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="family-invitation-primary-button"
              onClick={handleAcceptInvitation}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <span className="button-spinner"></span>
                  Joining Family...
                </>
              ) : (
                <>
                  Accept Invitation
                  <span>→</span>
                </>
              )}
            </button>

            <p className="invitation-login-note">
              You must be logged in using the invited email address to accept
              this invitation.
            </p>
          </>
        )}

        <button
          type="button"
          className="family-invitation-secondary-button"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </main>
    </div>
  );
}

export default FamilyInvitationPage;
