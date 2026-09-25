import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function InviteMemberPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [invitations, setInvitations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * ============================================================
   * FAMILY SETTINGS
   * ============================================================
   */

  const [familySettings, setFamilySettings] = useState(null);

  const [settingsLoading, setSettingsLoading] = useState(true);

  /*
   * ============================================================
   * LOAD FAMILY SETTINGS
   * ============================================================
   */

  const loadFamilySettings = async () => {
    try {
      setSettingsLoading(true);

      const response = await api.get("/api/families/settings");

      setFamilySettings(response.data || null);
    } catch (error) {
      console.error("Load family settings error:", error);

      /*
       * We don't immediately block the page here.
       * The backend will still enforce the permission.
       */

      setFamilySettings(null);
    } finally {
      setSettingsLoading(false);
    }
  };

  /*
   * ============================================================
   * LOAD SENT INVITATIONS
   * ============================================================
   */

  const loadInvitations = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await api.get("/api/families/invitations");

      setInvitations(response.data || []);
    } catch (error) {
      console.error("Load invitations error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to load invitations.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    loadFamilySettings();

    loadInvitations();
  }, []);

  /*
   * ============================================================
   * CHECK INVITATION PERMISSION
   * ============================================================
   */

  const invitationsAllowed = familySettings?.membersCanInvite !== false;

  /*
   * ============================================================
   * SEND INVITATION
   * ============================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    /*
     * Frontend permission check.
     *
     * Backend also performs this check, so this is
     * only for better user experience.
     */

    if (!invitationsAllowed) {
      setError("The family owner has disabled member invitations.");

      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter the member's email address.");

      return;
    }

    try {
      setSending(true);

      await api.post("/api/families/invitations", {
        email: trimmedEmail,
      });

      setSuccess(`Invitation sent successfully to ${trimmedEmail}.`);

      setEmail("");

      await loadInvitations();
    } catch (error) {
      console.error("Send invitation error:", error);

      /*
       * If backend returns 403, show a friendly
       * permission message.
       */

      if (error.response?.status === 403) {
        setError(
          error.response?.data?.message ||
            "You are not allowed to send family invitations.",
        );

        /*
         * Refresh settings in case the owner changed
         * the permission while this page was open.
         */

        await loadFamilySettings();
      } else {
        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "Unable to send invitation.",
        );
      }
    } finally {
      setSending(false);
    }
  };

  /*
   * ============================================================
   * FORMAT STATUS
   * ============================================================
   */

  const getStatusClass = (status) => {
    if (!status) {
      return "pending";
    }

    return status.toLowerCase().replace(/\s+/g, "-");
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="invite-member-page">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="invite-member-background">
        <div className="invite-orb invite-orb-one"></div>

        <div className="invite-orb invite-orb-two"></div>

        <div className="invite-orb invite-orb-three"></div>

        <span className="invite-floating-leaf leaf-one">🍃</span>

        <span className="invite-floating-leaf leaf-two">🍂</span>

        <span className="invite-floating-leaf leaf-three">🍃</span>

        <span className="invite-floating-leaf leaf-four">🍃</span>
      </div>

      <main className="invite-member-container">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <button
          type="button"
          className="invite-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="invite-header">
          <div className="invite-icon">💌</div>

          <span className="invite-kicker">GROW YOUR FAMILY TREE</span>

          <h1>
            Invite someone
            <span> to your family.</span>
          </h1>

          <p>
            Bring your loved ones into your family story. They'll receive an
            invitation and can join using their own account.
          </p>
        </div>

        {/* ====================================================
            PERMISSION MESSAGE
        ==================================================== */}

        {!settingsLoading && !invitationsAllowed && (
          <section className="invite-form-card">
            <div className="invite-form-decoration">🔒</div>

            <div className="invite-form-content">
              <span className="invite-form-kicker">INVITATIONS DISABLED</span>

              <h2>Member invitations are disabled</h2>

              <p>
                The family owner has currently disabled the ability for family
                members to invite new people.
              </p>

              <div className="invite-security-note">
                <span>ℹ️</span>

                <p>
                  If you need to invite someone, please ask the family owner to
                  enable <strong>Members Can Invite</strong> in Family Settings.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================
            INVITE CARD
        ==================================================== */}

        {(settingsLoading || invitationsAllowed) && (
          <section className="invite-form-card">
            <div className="invite-form-decoration">🌳</div>

            <div className="invite-form-content">
              <span className="invite-form-kicker">SEND AN INVITATION</span>

              <h2>Who would you like to invite?</h2>

              <p>
                Enter their registered email address. If they don't have an
                account yet, they can create one using the same email.
              </p>

              {error && (
                <div className="invite-error">
                  <span>⚠️</span>

                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="invite-success">
                  <span>🎉</span>

                  <span>{success}</span>
                </div>
              )}

              {settingsLoading ? (
                <div className="invitations-loading">
                  <div>🌳</div>

                  <p>Checking family invitation settings...</p>
                </div>
              ) : (
                <form className="invite-form" onSubmit={handleSubmit}>
                  <div className="invite-input-wrapper">
                    <span className="invite-input-icon">✉</span>

                    <input
                      type="email"
                      placeholder="familymember@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={sending}
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    className="send-invitation-button"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <span className="button-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Invitation
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="invite-security-note">
                <span>🔐</span>

                <p>
                  Each invitation is tied to the invited email address. Only
                  that account can accept the invitation.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================
            SENT INVITATIONS
        ==================================================== */}

        <section className="sent-invitations-section">
          <div className="sent-invitations-heading">
            <div>
              <span className="invite-form-kicker">INVITATION HISTORY</span>

              <h2>Invitations you've sent</h2>
            </div>

            <button
              type="button"
              className="refresh-invitations-button"
              onClick={loadInvitations}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="invitations-loading">
              <div>🌳</div>

              <p>Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="empty-invitations">
              <div className="empty-invitations-icon">💌</div>

              <h3>No invitations yet</h3>

              <p>
                Invite your first family member and start growing your family
                tree together.
              </p>
            </div>
          ) : (
            <div className="sent-invitations-list">
              {invitations.map((invitation, index) => (
                <div
                  className="sent-invitation-card"
                  key={invitation.id || invitation.token || index}
                >
                  <div className="sent-invitation-avatar">
                    {invitation.invitedEmail?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  <div className="sent-invitation-info">
                    <strong>
                      {invitation.invitedEmail || "Unknown email"}
                    </strong>

                    <span>
                      {invitation.createdAt
                        ? `Sent ${new Date(
                            invitation.createdAt,
                          ).toLocaleString()}`
                        : "Invitation sent"}
                    </span>
                  </div>

                  <span
                    className={`invitation-status ${getStatusClass(
                      invitation.status,
                    )}`}
                  >
                    {invitation.status || "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default InviteMemberPage;
