import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api";

function FamilySettingsPage() {
  /*
   * ============================================================
   * EXISTING SETTINGS STATE
   * ============================================================
   */

  const [settings, setSettings] = useState(null);

  const [familyName, setFamilyName] = useState("");
  const [familyDescription, setFamilyDescription] = useState("");

  const [familyProfileVisible, setFamilyProfileVisible] = useState(true);

  const [membersCanInvite, setMembersCanInvite] = useState(true);

  const [membersCanEditFamily, setMembersCanEditFamily] = useState(false);

  const [membersCanManageMembers, setMembersCanManageMembers] = useState(false);

  const [newMemberNotifications, setNewMemberNotifications] = useState(true);

  const [birthdayNotifications, setBirthdayNotifications] = useState(true);

  const [anniversaryNotifications, setAnniversaryNotifications] =
    useState(true);

  const [eventNotifications, setEventNotifications] = useState(true);

  const [whatsappNotifications, setWhatsappNotifications] = useState(false);

  /*
   * ============================================================
   * PAGE STATE
   * ============================================================
   */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /*
   * ============================================================
   * OWNERSHIP TRANSFER STATE
   * ============================================================
   */

  const [familyMembers, setFamilyMembers] = useState([]);

  const [selectedNewOwner, setSelectedNewOwner] = useState("");

  const [loadingMembers, setLoadingMembers] = useState(false);

  const [transferringOwnership, setTransferringOwnership] = useState(false);

  const [showTransferConfirmation, setShowTransferConfirmation] =
    useState(false);

  /*
   * ============================================================
   * GET AUTH TOKEN
   * ============================================================
   *
   * Uses the same localStorage token approach normally used
   * by the existing application.
   */

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /*
   * ============================================================
   * LOAD SETTINGS
   * ============================================================
   */

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/families/settings`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to load family settings.");
      }

      const data = await response.json();

      setSettings(data);

      /*
       * ====================================================
       * FAMILY DETAILS
       * ====================================================
       */

      setFamilyName(data.familyName || "");

      setFamilyDescription(data.familyDescription || "");

      /*
       * ====================================================
       * EXISTING SETTINGS
       * ====================================================
       */

      setFamilyProfileVisible(data.familyProfileVisible ?? true);

      setMembersCanInvite(data.membersCanInvite ?? true);

      setMembersCanEditFamily(data.membersCanEditFamily ?? false);

      setMembersCanManageMembers(data.membersCanManageMembers ?? false);

      setNewMemberNotifications(data.newMemberNotifications ?? true);

      setBirthdayNotifications(data.birthdayNotifications ?? true);

      setAnniversaryNotifications(data.anniversaryNotifications ?? true);

      setEventNotifications(data.eventNotifications ?? true);

      setWhatsappNotifications(data.whatsappNotifications ?? false);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load family settings.");
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
    loadSettings();
  }, []);

  /*
   * ============================================================
   * LOAD FAMILY MEMBERS
   * ============================================================
   *
   * This is only needed by the family owner.
   */

  const loadFamilyMembers = async () => {
    if (!settings?.isFamilyOwner) {
      return;
    }

    try {
      setLoadingMembers(true);

      const response = await fetch(`${API_BASE_URL}/families/members`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.message || "Failed to load family members.");
      }

      const data = await response.json();

      setFamilyMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load family members.");
    } finally {
      setLoadingMembers(false);
    }
  };

  /*
   * ============================================================
   * LOAD MEMBERS WHEN OWNER DATA IS AVAILABLE
   * ============================================================
   */

  useEffect(() => {
    if (settings && settings.isFamilyOwner === true) {
      loadFamilyMembers();
    }
  }, [settings?.isFamilyOwner]);

  /*
   * ============================================================
   * SAVE SETTINGS
   * ============================================================
   */

  const handleSave = async () => {
    try {
      setSaving(true);

      setMessage("");

      setError("");

      const requestBody = {
        familyName: familyName,

        familyDescription: familyDescription,

        familyProfileVisible: familyProfileVisible,

        membersCanInvite: membersCanInvite,

        membersCanEditFamily: membersCanEditFamily,

        membersCanManageMembers: membersCanManageMembers,

        newMemberNotifications: newMemberNotifications,

        birthdayNotifications: birthdayNotifications,

        anniversaryNotifications: anniversaryNotifications,

        eventNotifications: eventNotifications,

        whatsappNotifications: whatsappNotifications,
      };

      const response = await fetch(`${API_BASE_URL}/families/settings`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save family settings.");
      }

      setSettings(data);

      setFamilyName(data.familyName || "");

      setFamilyDescription(data.familyDescription || "");

      setMessage("Family settings saved successfully.");
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to save family settings.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * OPEN TRANSFER CONFIRMATION
   * ============================================================
   */

  const handleTransferClick = () => {
    setError("");

    setMessage("");

    if (!selectedNewOwner) {
      setError("Please select a family member.");

      return;
    }

    setShowTransferConfirmation(true);
  };

  /*
   * ============================================================
   * TRANSFER OWNERSHIP
   * ============================================================
   */

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      return;
    }

    try {
      setTransferringOwnership(true);

      setError("");

      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/families/transfer-ownership`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            newOwnerId: Number(selectedNewOwner),
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to transfer family ownership.",
        );
      }

      /*
       * ====================================================
       * OWNERSHIP TRANSFER SUCCESS
       * ====================================================
       */

      setShowTransferConfirmation(false);

      setSelectedNewOwner("");

      setMessage("Family ownership transferred successfully.");

      /*
       * ====================================================
       * RELOAD SETTINGS
       * ====================================================
       *
       * The current user is no longer the owner.
       * This automatically updates:
       *
       * settings.isFamilyOwner
       *
       * and therefore the owner-only UI.
       */

      await loadSettings();

      setFamilyMembers([]);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to transfer family ownership.");
    } finally {
      setTransferringOwnership(false);
    }
  };

  /*
   * ============================================================
   * CANCEL TRANSFER
   * ============================================================
   */

  const cancelTransfer = () => {
    if (transferringOwnership) {
      return;
    }

    setShowTransferConfirmation(false);
  };

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loading) {
    return (
      <div className="family-settings-page">
        <div className="family-settings-loading">
          <div className="settings-spinner"></div>

          <p>Loading family settings...</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * OWNER STATUS
   * ============================================================
   */

  const isFamilyOwner = settings?.isFamilyOwner === true;

  /*
   * ============================================================
   * SELECTED MEMBER
   * ============================================================
   */

  const selectedMember = familyMembers.find(
    (member) => String(member.id) === String(selectedNewOwner),
  );

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="family-settings-page">
      <div className="family-settings-container">
        {/* ==================================================
                    PAGE HEADER
                ================================================== */}

        <div className="settings-page-header">
          <div>
            <h1>Family Settings</h1>

            <p>
              Manage your family information, member permissions and
              notifications.
            </p>
          </div>
        </div>

        {/* ==================================================
                    SUCCESS MESSAGE
                ================================================== */}

        {message && (
          <div className="settings-success-message">
            <span>✓</span>

            {message}
          </div>
        )}

        {/* ==================================================
                    ERROR MESSAGE
                ================================================== */}

        {error && (
          <div className="settings-error-message">
            <span>!</span>

            {error}
          </div>
        )}

        {/* ==================================================
                    FAMILY DETAILS
                ================================================== */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Family Details</h2>

              <p>Manage your family information.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Family ID</label>

              <input type="text" value={settings?.familyId || ""} disabled />
            </div>

            <div className="settings-form-group">
              <label>Family Name</label>

              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={!isFamilyOwner}
                maxLength={255}
              />
            </div>
          </div>

          <div className="settings-form-group">
            <label>Family Description</label>

            <textarea
              value={familyDescription}
              onChange={(e) => setFamilyDescription(e.target.value)}
              disabled={!isFamilyOwner}
              maxLength={1000}
              rows={5}
            />

            <div className="character-counter">
              {familyDescription.length}
              /1000
            </div>
          </div>

          {/* ==================================================
                        OWNERSHIP STATUS
                    ================================================== */}

          <div className="ownership-status">
            <div>
              <span className="ownership-label">Family Ownership</span>

              <span className={isFamilyOwner ? "owner-badge" : "member-badge"}>
                {isFamilyOwner ? "Family Owner" : "Family Member"}
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
                    FAMILY PROFILE
                ================================================== */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Family Profile</h2>

              <p>Control the visibility of your family profile.</p>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Family Profile Visible</h3>

              <p>Allow family members to view the family profile.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={familyProfileVisible}
                onChange={(e) => setFamilyProfileVisible(e.target.checked)}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* ==================================================
                    MEMBER PERMISSIONS
                ================================================== */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Member Permissions</h2>

              <p>Control what family members are allowed to do.</p>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Members Can Invite</h3>

              <p>Allow members to invite new people to the family.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={membersCanInvite}
                onChange={(e) => setMembersCanInvite(e.target.checked)}
                disabled={!isFamilyOwner}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Members Can Edit Family</h3>

              <p>Allow members to edit family information.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={membersCanEditFamily}
                onChange={(e) => setMembersCanEditFamily(e.target.checked)}
                disabled={!isFamilyOwner}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Members Can Manage Members</h3>

              <p>Allow members to manage other family members.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={membersCanManageMembers}
                onChange={(e) => setMembersCanManageMembers(e.target.checked)}
                disabled={!isFamilyOwner}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* ==================================================
                    NOTIFICATIONS
                ================================================== */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Notifications</h2>

              <p>Choose which family events you want to be notified about.</p>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>New Member Notifications</h3>

              <p>Get notified when a new member joins the family.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={newMemberNotifications}
                onChange={(e) => setNewMemberNotifications(e.target.checked)}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Birthday Notifications</h3>

              <p>Receive reminders for family birthdays.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={birthdayNotifications}
                onChange={(e) => setBirthdayNotifications(e.target.checked)}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Anniversary Notifications</h3>

              <p>Receive reminders for family anniversaries.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={anniversaryNotifications}
                onChange={(e) => setAnniversaryNotifications(e.target.checked)}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>Event Notifications</h3>

              <p>Receive notifications about family events.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={eventNotifications}
                onChange={(e) => setEventNotifications(e.target.checked)}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-information">
              <h3>WhatsApp Notifications</h3>

              <p>Receive supported family notifications through WhatsApp.</p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
              />

              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* ==================================================
                    TRANSFER OWNERSHIP
                    OWNER ONLY
                ================================================== */}

        {isFamilyOwner && (
          <section className="settings-card ownership-transfer-card">
            <div className="settings-card-header">
              <div>
                <h2>Transfer Ownership</h2>

                <p>
                  Transfer ownership of this family to another existing family
                  member.
                </p>
              </div>
            </div>

            <div className="ownership-warning">
              <span className="warning-icon">⚠</span>

              <div>
                <strong>Important</strong>

                <p>
                  After transferring ownership, you will remain a family member
                  but you will no longer be the family owner.
                </p>
              </div>
            </div>

            <div className="settings-form-group">
              <label>Select New Family Owner</label>

              {loadingMembers ? (
                <div className="member-loading">Loading family members...</div>
              ) : (
                <select
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                >
                  <option value="">Select a family member</option>

                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                      {" — "}
                      {member.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {familyMembers.length === 0 && !loadingMembers && (
              <p className="no-family-members">
                There are no other family members available for ownership
                transfer.
              </p>
            )}

            <div className="transfer-actions">
              <button
                type="button"
                className="transfer-owner-button"
                onClick={handleTransferClick}
                disabled={
                  !selectedNewOwner || transferringOwnership || loadingMembers
                }
              >
                Transfer Ownership
              </button>
            </div>
          </section>
        )}

        {/* ==================================================
                    SAVE BUTTON
                ================================================== */}

        <div className="settings-save-container">
          <button
            type="button"
            className="settings-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ======================================================
                TRANSFER CONFIRMATION MODAL
            ====================================================== */}

      {showTransferConfirmation && (
        <div className="transfer-modal-overlay" onClick={cancelTransfer}>
          <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="transfer-modal-icon">⚠</div>

            <h2>Transfer Family Ownership?</h2>

            <p>You are about to transfer ownership of this family to:</p>

            {selectedMember && (
              <div className="selected-owner-preview">
                <strong>{selectedMember.fullName}</strong>

                <span>{selectedMember.email}</span>
              </div>
            )}

            <p className="transfer-final-warning">
              After this action, you will remain a family member, but you will
              no longer have family-owner privileges.
            </p>

            <div className="transfer-modal-actions">
              <button
                type="button"
                className="cancel-transfer-button"
                onClick={cancelTransfer}
                disabled={transferringOwnership}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-transfer-button"
                onClick={handleTransferOwnership}
                disabled={transferringOwnership}
              >
                {transferringOwnership ? "Transferring..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilySettingsPage;
