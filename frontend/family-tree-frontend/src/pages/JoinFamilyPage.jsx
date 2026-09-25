import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function JoinFamilyPage() {
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [acceptingToken, setAcceptingToken] = useState(null);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /*
   * ============================================================
   * LOAD INVITATIONS
   * ============================================================
   */

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.get("/api/families/invitations");

      setInvitations(response.data || []);
    } catch (error) {
      console.error("Unable to load invitations:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to load family invitations.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * ACCEPT INVITATION
   * ============================================================
   */

  const handleAccept = async (invitation) => {
    const token = invitation.token;

    if (!token) {
      setError("This invitation does not contain a valid token.");

      return;
    }

    try {
      setAcceptingToken(token);

      setError("");
      setMessage("");

      await api.post(`/api/families/invitations/token/${token}/accept`);

      setMessage("You have successfully joined the family!");

      /*
       * Give the success message a moment to appear,
       * then go to the dashboard.
       */

      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error("Accept invitation error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to accept this invitation.",
      );
    } finally {
      setAcceptingToken(null);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="join-family-page">
        <div className="join-family-loading">
          <div className="join-family-spinner">🌳</div>

          <h2>Looking for your family...</h2>

          <p>Checking your invitations.</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="join-family-page">
      <div className="join-family-background">
        <div className="join-orb join-orb-one"></div>

        <div className="join-orb join-orb-two"></div>

        <div className="join-orb join-orb-three"></div>

        <span className="join-floating-leaf leaf-one">🍃</span>

        <span className="join-floating-leaf leaf-two">🍂</span>

        <span className="join-floating-leaf leaf-three">🍃</span>

        <span className="join-floating-leaf leaf-four">🍃</span>
      </div>

      <main className="join-family-container">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="join-family-icon">💌</div>

        <span className="join-family-kicker">FAMILY INVITATIONS</span>

        <h1>
          Find your place
          <span> in the story.</span>
        </h1>

        <p className="join-family-description">
          When a family member invites you, their invitation will appear here.
          <br />
          Accept it to become part of their family tree.
        </p>

        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {message && (
          <div className="join-family-success">
            <span>🎉</span>

            <p>{message}</p>
          </div>
        )}

        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (
          <div className="join-family-error">
            <span>⚠️</span>

            <p>{error}</p>
          </div>
        )}

        {/* ====================================================
            INVITATIONS
        ==================================================== */}

        {invitations.length === 0 ? (
          <section className="no-invitations">
            <div className="no-invitations-tree">🌱</div>

            <h2>No invitations yet</h2>

            <p>
              Your family invitation will appear here when someone invites you.
            </p>

            <div className="invitation-waiting">
              <span>💌</span>

              <div>
                <strong>Waiting for your family...</strong>

                <small>
                  You can safely return here anytime to check again.
                </small>
              </div>
            </div>
          </section>
        ) : (
          <section className="invitations-section">
            <div className="invitations-heading">
              <div>
                <span>{invitations.length}</span>

                <h2>
                  Family invitation
                  {invitations.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <button
                type="button"
                className="refresh-invitations"
                onClick={loadInvitations}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="invitation-list">
              {invitations.map((invitation, index) => (
                <article
                  className="invitation-card"
                  key={invitation.id || invitation.token || index}
                >
                  <div className="invitation-card-decoration">🌳</div>

                  <div className="invitation-card-content">
                    <span className="invitation-label">YOU'RE INVITED</span>

                    <h3>
                      {invitation.familyName ||
                        invitation.family?.name ||
                        "Family Tree"}
                    </h3>

                    <p>You have been invited to become part of this family.</p>

                    {invitation.invitedBy && (
                      <span className="invited-by">
                        Invited by <strong>{invitation.invitedBy}</strong>
                      </span>
                    )}

                    {invitation.invitedEmail && (
                      <span className="invited-email">
                        ✉ {invitation.invitedEmail}
                      </span>
                    )}

                    {invitation.expiresAt && (
                      <span className="invitation-expiry">
                        ⏳ Expires:{" "}
                        {new Date(invitation.expiresAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="accept-invitation-button"
                    onClick={() => handleAccept(invitation)}
                    disabled={acceptingToken === invitation.token}
                  >
                    {acceptingToken === invitation.token ? (
                      <>
                        <span className="button-spinner"></span>
                        Joining...
                      </>
                    ) : (
                      <>
                        Accept Invitation
                        <span>→</span>
                      </>
                    )}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          className="join-family-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Family Gateway
        </button>

        {/* ====================================================
            SECURITY NOTE
        ==================================================== */}

        <div className="join-family-security">
          <span>🔐</span>

          <p>
            Family invitations are private. Only invitations sent to your
            registered email can be accepted.
          </p>
        </div>
      </main>
    </div>
  );
}

export default JoinFamilyPage;
