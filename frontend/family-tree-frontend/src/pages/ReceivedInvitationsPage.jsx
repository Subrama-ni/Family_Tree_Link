import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ReceivedInvitationsPage() {
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ============================================================
   * LOAD RECEIVED INVITATIONS
   * ============================================================
   */

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/families/invitations/received");

      setInvitations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Load received invitations error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to load your received invitations.",
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
    loadInvitations();
  }, []);

  /*
   * ============================================================
   * PENDING INVITATION COUNT
   * ============================================================
   */

  const pendingCount = useMemo(() => {
    return invitations.filter(
      (invitation) =>
        String(invitation.status || "").toUpperCase() === "PENDING",
    ).length;
  }, [invitations]);

  /*
   * ============================================================
   * FAMILY NAME
   * ============================================================
   */

  const getFamilyName = (invitation) => {
    return (
      invitation?.family?.name ||
      invitation?.family?.familyName ||
      invitation?.familyName ||
      "Your Family"
    );
  };

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  const formatDate = (value) => {
    if (!value) {
      return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  /*
   * ============================================================
   * ACCEPT INVITATION
   * ============================================================
   */

  const handleAccept = async (invitation) => {
    if (!invitation?.id || processingId !== null) {
      return;
    }

    /*
     * IMPORTANT:
     * Show the warning before sending the API request.
     */

    const confirmed = window.confirm(
      "If you accept this invitation, you will be removed from your current family. " +
        "All your existing details will remain saved in your current family. " +
        "Do you want to continue?",
    );

    /*
     * Do not call the backend when the member clicks Cancel.
     */

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(invitation.id);
      setError("");
      setSuccess("");

      await api.post(`/api/families/invitations/${invitation.id}/accept`);

      /*
       * Update only this invitation.
       * Do not log the user out.
       * Do not redirect automatically.
       */

      setInvitations((currentInvitations) =>
        currentInvitations.map((item) =>
          item.id === invitation.id
            ? {
                ...item,
                status: "ACCEPTED",
              }
            : item,
        ),
      );

      setSuccess(
        `You joined ${getFamilyName(
          invitation,
        )} successfully. You were removed from your previous family, but all your existing details remain saved there.`,
      );
    } catch (error) {
      console.error("Accept invitation error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to accept this invitation.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ============================================================
   * DECLINE INVITATION
   * ============================================================
   */

  const handleDecline = async (invitation) => {
    if (!invitation?.id || processingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to decline this family invitation?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(invitation.id);
      setError("");
      setSuccess("");

      await api.post(`/api/families/invitations/${invitation.id}/decline`);

      setInvitations((currentInvitations) =>
        currentInvitations.map((item) =>
          item.id === invitation.id
            ? {
                ...item,
                status: "DECLINED",
              }
            : item,
        ),
      );

      setSuccess("The invitation has been declined.");
    } catch (error) {
      console.error("Decline invitation error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to decline this invitation.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <div style={styles.page}>
        <main style={styles.container}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <section style={styles.loadingCard}>
            <div style={styles.largeIcon}>💌</div>

            <div style={styles.spinner}></div>

            <h1 style={styles.heading}>Checking your invitations...</h1>

            <p style={styles.mutedText}>
              Looking for family invitations waiting for you.
            </p>
          </section>
        </main>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN PAGE
   * ============================================================
   */

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        {/* Back Button */}

        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}

        <header style={styles.header}>
          <div style={styles.headerIcon}>💌</div>

          <span style={styles.kicker}>FAMILY CONNECTIONS</span>

          <h1 style={styles.title}>Your Family Invitations</h1>

          <p style={styles.subtitle}>
            See family invitations sent to you and choose which family stories
            you would like to become part of.
          </p>

          <div style={styles.summaryRow}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryIcon}>✉</span>

              <div>
                <strong style={styles.summaryNumber}>
                  {invitations.length}
                </strong>

                <span style={styles.summaryLabel}>Total Invitations</span>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryIcon}>⏳</span>

              <div>
                <strong style={styles.summaryNumber}>{pendingCount}</strong>

                <span style={styles.summaryLabel}>Awaiting Response</span>
              </div>
            </div>
          </div>
        </header>

        {/* Error Message */}

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}

        {success && (
          <div style={styles.successBox}>
            <span>✓</span>

            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Empty State */}

        {invitations.length === 0 ? (
          <section style={styles.emptyCard}>
            <div style={styles.largeIcon}>🌳</div>

            <span style={styles.kicker}>YOUR INBOX IS CLEAR</span>

            <h2 style={styles.heading}>No family invitations yet</h2>

            <p style={styles.mutedText}>
              When someone invites you to join their family tree, the invitation
              will appear here.
            </p>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard →
            </button>
          </section>
        ) : (
          <section>
            {/* List Header */}

            <div style={styles.listHeader}>
              <div>
                <span style={styles.kicker}>INVITATION INBOX</span>

                <h2 style={styles.listTitle}>Invitations waiting for you</h2>
              </div>

              <button
                type="button"
                style={styles.refreshButton}
                onClick={loadInvitations}
                disabled={processingId !== null}
              >
                ↻ Refresh
              </button>
            </div>

            {/* Invitation List */}

            <div style={styles.invitationList}>
              {invitations.map((invitation, index) => {
                const status = String(
                  invitation.status || "PENDING",
                ).toUpperCase();

                const isPending = status === "PENDING";
                const isProcessing = processingId === invitation.id;

                return (
                  <article
                    key={invitation.id || invitation.token || index}
                    style={styles.invitationCard}
                  >
                    {/* Invitation Icon */}

                    <div style={styles.invitationIcon}>🏡</div>

                    {/* Invitation Content */}

                    <div style={styles.invitationContent}>
                      <div style={styles.topRow}>
                        <div>
                          <span style={styles.familyKicker}>
                            FAMILY INVITATION
                          </span>

                          <h3 style={styles.familyName}>
                            {getFamilyName(invitation)}
                          </h3>
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(status === "PENDING"
                              ? styles.statusPending
                              : status === "ACCEPTED"
                                ? styles.statusAccepted
                                : status === "DECLINED"
                                  ? styles.statusDeclined
                                  : styles.statusExpired),
                          }}
                        >
                          {status}
                        </span>
                      </div>

                      <p style={styles.description}>
                        You have been invited to join this family tree and
                        become part of their shared family story.
                      </p>

                      <div style={styles.metaRow}>
                        <span>
                          📅 Received {formatDate(invitation.createdAt)}
                        </span>

                        {invitation.expiresAt && (
                          <span>
                            ⏰ Expires {formatDate(invitation.expiresAt)}
                          </span>
                        )}
                      </div>

                      {/*
                       * View Current Family is ALWAYS visible.
                       *
                       * It is not dependent on invitation status.
                       */}

                      <div style={styles.actions}>
                        <button
                          type="button"
                          style={styles.viewCurrentFamilyButton}
                          onClick={() => navigate("/dashboard")}
                          disabled={isProcessing}
                        >
                          🌳 View Current Family
                        </button>
                      </div>

                      {/* Accept and Decline Buttons */}

                      {isPending && (
                        <div style={styles.actions}>
                          <button
                            type="button"
                            style={{
                              ...styles.acceptButton,
                              ...(isProcessing ? styles.disabledButton : {}),
                            }}
                            onClick={() => handleAccept(invitation)}
                            disabled={processingId !== null}
                          >
                            {isProcessing
                              ? "Processing..."
                              : "✓ Accept Invitation"}
                          </button>

                          <button
                            type="button"
                            style={styles.declineButton}
                            onClick={() => handleDecline(invitation)}
                            disabled={processingId !== null}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}

                      {/* Accepted Message */}

                      {status === "ACCEPTED" && (
                        <div style={styles.completedMessage}>
                          <span>✓</span>

                          <p>
                            You accepted this invitation and joined this family.
                          </p>
                        </div>
                      )}

                      {/* Declined Message */}

                      {status === "DECLINED" && (
                        <div style={styles.declinedMessage}>
                          <span>○</span>

                          <p>You declined this family invitation.</p>
                        </div>
                      )}

                      {/* Expired Message */}

                      {status === "EXPIRED" && (
                        <div style={styles.expiredMessage}>
                          <span>⏰</span>

                          <p>This invitation has expired.</p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer Note */}

        <section style={styles.securityNote}>
          <span>🔐</span>

          <div>
            <strong>Your invitations are private</strong>

            <p>
              Only invitations sent to your account can be viewed and responded
              to here.
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes receivedInvitationSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .received-invitation-summary {
            grid-template-columns: 1fr !important;
          }

          .received-invitation-top-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .received-invitation-actions {
            flex-direction: column !important;
          }

          .received-invitation-actions button {
            width: 100% !important;
          }

          .received-invitation-meta {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}

/*
 * ============================================================
 * INLINE STYLES
 * ============================================================
 */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "42px 20px 70px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #f5f8f1 0%, #eef4e8 45%, #f8faf6 100%)",
    color: "#293426",
  },

  container: {
    width: "min(1050px, 100%)",
    margin: "0 auto",
  },

  backButton: {
    border: "1px solid rgba(88, 112, 71, 0.18)",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#526b43",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "42px",
  },

  header: {
    textAlign: "center",
    marginBottom: "42px",
  },

  headerIcon: {
    width: "76px",
    height: "76px",
    margin: "0 auto 18px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "35px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(231,239,224,0.92))",
    border: "1px solid rgba(102, 135, 79, 0.16)",
    boxShadow: "0 16px 35px rgba(71, 94, 60, 0.10)",
  },

  kicker: {
    display: "block",
    color: "#78945f",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "2.5px",
    marginBottom: "12px",
  },

  title: {
    margin: 0,
    color: "#293a24",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(34px, 5vw, 52px)",
    lineHeight: 1.08,
  },

  subtitle: {
    maxWidth: "680px",
    margin: "18px auto 0",
    color: "#6b7665",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  summaryRow: {
    width: "min(600px, 100%)",
    margin: "30px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    padding: "17px 20px",
    borderRadius: "17px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(96, 124, 76, 0.13)",
    boxShadow: "0 10px 28px rgba(70, 90, 65, 0.06)",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e6efdf",
    color: "#6a8a55",
    fontSize: "20px",
  },

  summaryNumber: {
    display: "block",
    fontSize: "22px",
    color: "#35492c",
  },

  summaryLabel: {
    display: "block",
    marginTop: "2px",
    fontSize: "12px",
    color: "#7a8575",
  },

  errorBox: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "17px 20px",
    marginBottom: "20px",
    borderRadius: "16px",
    background: "#fff5f2",
    border: "1px solid rgba(180, 104, 86, 0.18)",
    color: "#805248",
  },

  successBox: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "17px 20px",
    marginBottom: "20px",
    borderRadius: "16px",
    background: "#f0f8ec",
    border: "1px solid rgba(91, 133, 69, 0.18)",
    color: "#4d7040",
  },

  loadingCard: {
    minHeight: "480px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "45px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(98, 125, 79, 0.14)",
  },

  emptyCard: {
    textAlign: "center",
    padding: "65px 35px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(98, 125, 79, 0.14)",
  },

  largeIcon: {
    fontSize: "55px",
    marginBottom: "18px",
  },

  heading: {
    color: "#34472d",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "30px",
  },

  mutedText: {
    color: "#737e6e",
    lineHeight: 1.7,
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid rgba(105, 137, 82, 0.18)",
    borderTopColor: "#718f59",
    borderRadius: "50%",
    animation: "receivedInvitationSpin 0.8s linear infinite",
    marginBottom: "22px",
  },

  primaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #6c8e55, #567542)",
    color: "#ffffff",
    padding: "13px 20px",
    borderRadius: "13px",
    cursor: "pointer",
    fontWeight: 700,
  },

  listHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },

  listTitle: {
    margin: "7px 0 0",
    color: "#33452d",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "28px",
  },

  refreshButton: {
    border: "1px solid rgba(93, 122, 72, 0.18)",
    background: "rgba(255,255,255,0.78)",
    color: "#607a50",
    padding: "10px 15px",
    borderRadius: "11px",
    cursor: "pointer",
    fontWeight: 650,
  },

  invitationList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  invitationCard: {
    display: "flex",
    gap: "20px",
    padding: "25px",
    borderRadius: "23px",
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(98, 125, 79, 0.14)",
    boxShadow: "0 18px 45px rgba(69, 91, 61, 0.08)",
  },

  invitationIcon: {
    width: "58px",
    height: "58px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    background: "#e6efdf",
    fontSize: "28px",
  },

  invitationContent: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  familyKicker: {
    color: "#82966f",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.8px",
  },

  familyName: {
    margin: "7px 0 0",
    color: "#33452d",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "25px",
  },

  statusBadge: {
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },

  statusPending: {
    background: "#fff3d8",
    color: "#9b7020",
  },

  statusAccepted: {
    background: "#e0f1d9",
    color: "#4e7a40",
  },

  statusDeclined: {
    background: "#fbe5e2",
    color: "#a45b51",
  },

  statusExpired: {
    background: "#e8e8e8",
    color: "#777777",
  },

  description: {
    color: "#6f7c69",
    lineHeight: 1.7,
    margin: "14px 0",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    color: "#8a9483",
    fontSize: "12px",
    marginBottom: "18px",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "12px",
  },

  viewCurrentFamilyButton: {
    border: "1px solid rgba(88, 112, 71, 0.25)",
    background: "linear-gradient(135deg, #edf4e8, #dfead9)",
    color: "#526f43",
    padding: "11px 16px",
    borderRadius: "11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  acceptButton: {
    border: "none",
    background: "linear-gradient(135deg, #6c8e55, #567542)",
    color: "#ffffff",
    padding: "11px 16px",
    borderRadius: "11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  declineButton: {
    border: "1px solid rgba(180, 104, 86, 0.25)",
    background: "#fff5f2",
    color: "#a45b51",
    padding: "11px 16px",
    borderRadius: "11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  completedMessage: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#f0f8ec",
    color: "#4d7040",
  },

  declinedMessage: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#fff5f2",
    color: "#a45b51",
  },

  expiredMessage: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#eeeeee",
    color: "#777777",
  },

  securityNote: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginTop: "35px",
    padding: "18px 20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.65)",
    color: "#6f7c69",
  },
};

export default ReceivedInvitationsPage;
