import { useEffect, useState } from "react";
import api from ".././services/api";
import "./FamilyMembershipPanel.css";

const FamilyMembershipPanel = () => {
  const [members, setMembers] = useState([]);
  const [isFamilyOwner, setIsFamilyOwner] = useState(false);
  const [membersCanLeaveFamily, setMembersCanLeaveFamily] = useState(true);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMembershipData = async () => {
    try {
      setLoading(true);
      setError("");

      const [membersResponse, settingsResponse] = await Promise.all([
        api.get("/families/membership"),
        api.get("/families/settings"),
      ]);

      setMembers(membersResponse.data || []);

      const settings = settingsResponse.data || {};

      setIsFamilyOwner(
        settings.isFamilyOwner ??
          settings.familyOwner ??
          settings.owner ??
          false,
      );

      setMembersCanLeaveFamily(settings.membersCanLeaveFamily ?? true);
    } catch (err) {
      console.error("Error loading family membership:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load family membership details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembershipData();
  }, []);

  const handleRemoveMember = async (userId, memberName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this family?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.post(`/families/membership/${userId}/remove`);

      setSuccess(`${memberName} has been removed from the family.`);

      await loadMembershipData();
    } catch (err) {
      console.error("Error removing member:", err);

      setError(err.response?.data?.message || "Unable to remove this member.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveFamily = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this family?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.post("/families/membership/leave");

      setSuccess("You have successfully left the family.");
      setMembers([]);
    } catch (err) {
      console.error("Error leaving family:", err);

      setError(err.response?.data?.message || "Unable to leave the family.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMembersCanLeaveChange = async (event) => {
    const enabled = event.target.checked;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.put("/families/settings/members-can-leave", {
        enabled,
      });

      setMembersCanLeaveFamily(enabled);

      setSuccess(
        enabled
          ? "Members can now leave the family."
          : "Members are no longer allowed to leave the family.",
      );
    } catch (err) {
      console.error("Error updating member leave permission:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update family membership settings.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="family-membership-panel">
        <p className="membership-loading">Loading family members...</p>
      </section>
    );
  }

  return (
    <section className="family-membership-panel">
      <div className="membership-header">
        <div>
          <h2>Family Membership</h2>
          <p>Manage the people who are currently connected to this family.</p>
        </div>

        <span className="member-count">
          {members.length} {members.length === 1 ? "Member" : "Members"}
        </span>
      </div>

      {error && <div className="membership-message error-message">{error}</div>}

      {success && (
        <div className="membership-message success-message">{success}</div>
      )}

      {isFamilyOwner && (
        <div className="membership-setting-card">
          <div>
            <h3>Allow members to leave</h3>
            <p>
              When enabled, normal family members can leave this family whenever
              they want.
            </p>
          </div>

          <label className="switch-container">
            <input
              type="checkbox"
              checked={membersCanLeaveFamily}
              onChange={handleMembersCanLeaveChange}
              disabled={actionLoading}
            />

            <span className="switch-slider"></span>
          </label>
        </div>
      )}

      {!isFamilyOwner && membersCanLeaveFamily && (
        <div className="leave-family-card">
          <div>
            <h3>Leave family</h3>
            <p>
              You can leave this family. Your family-tree profile and
              relationships will be preserved.
            </p>
          </div>

          <button
            type="button"
            className="danger-button"
            onClick={handleLeaveFamily}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Leave Family"}
          </button>
        </div>
      )}

      {!isFamilyOwner && !membersCanLeaveFamily && (
        <div className="membership-info-card">
          The family owner has disabled the option for members to leave this
          family.
        </div>
      )}

      <div className="members-list">
        {members.length === 0 ? (
          <p className="empty-members">No family members found.</p>
        ) : (
          members.map((member) => (
            <div className="member-row" key={member.userId}>
              <div className="member-details">
                <div className="member-avatar">
                  {member.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                </div>
              </div>

              <div className="member-actions">
                {member.owner ? (
                  <span className="owner-badge">Family Owner</span>
                ) : (
                  isFamilyOwner && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        handleRemoveMember(member.userId, member.name)
                      }
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "Remove"}
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default FamilyMembershipPanel;
