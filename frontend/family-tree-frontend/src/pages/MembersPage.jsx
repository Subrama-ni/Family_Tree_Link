import { useEffect, useState } from "react";
import FamilyMembershipPanel from "./FamilyMembershipPanel";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function MembersPage() {
  const navigate = useNavigate();

  /*
   * ============================================================
   * MEMBERS
   * ============================================================
   */

  const [members, setMembers] = useState([]);

  /*
   * ============================================================
   * SEARCH + FILTER
   * ============================================================
   */

  const [searchTerm, setSearchTerm] = useState("");

  const [genderFilter, setGenderFilter] = useState("");

  /*
   * ============================================================
   * ADD MEMBER
   * ============================================================
   */

  const [selectedFile, setSelectedFile] = useState(null);

  /*
   * ============================================================
   * EDIT MEMBER
   * ============================================================
   */

  const [editingMember, setEditingMember] = useState(null);

  const [editFile, setEditFile] = useState(null);

  /*
   * ============================================================
   * LOADING + SAVING
   * ============================================================
   */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
   * ============================================================
   * FAMILY SETTINGS
   * ============================================================
   */

  const [membersCanManageMembers, setMembersCanManageMembers] = useState(false);

  /*
   * IMPORTANT:
   *
   * This tells us whether the currently logged-in user
   * is the owner of the family.
   */

  const [isFamilyOwner, setIsFamilyOwner] = useState(false);

  const [settingsLoading, setSettingsLoading] = useState(true);

  const [leavingFamily, setLeavingFamily] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  /*
   * ============================================================
   * ADD MEMBER FORM
   * ============================================================
   */

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    biography: "",
    occupation: "",
    imagePath: "",
  });

  /*
   * ============================================================
   * EDIT MEMBER FORM
   * ============================================================
   */

  const [editData, setEditData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    biography: "",
    occupation: "",
  });

  /*
   * ============================================================
   * EFFECTIVE PERMISSION
   * ============================================================
   *
   * Owner ALWAYS has permission.
   *
   * Normal members only have permission when the family
   * owner has enabled "Members Can Manage Members".
   */

  const canManageMembers = isFamilyOwner || membersCanManageMembers;

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    fetchMembers();

    fetchFamilySettings();
  }, []);

  /*
   * ============================================================
   * FETCH MEMBERS
   * ============================================================
   */

  const fetchMembers = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await api.get("/api/members");

      setMembers(response.data || []);
    } catch (error) {
      console.error("Error loading members:", error);

      setError(
        error.response?.data?.message || "Unable to load family members.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * FETCH FAMILY SETTINGS
   * ============================================================
   */

  const fetchFamilySettings = async () => {
    try {
      setSettingsLoading(true);

      const response = await api.get("/api/families/settings");

      /*
       * Backend now returns:
       *
       * {
       *   membersCanManageMembers: true/false,
       *   isFamilyOwner: true/false
       * }
       */

      setMembersCanManageMembers(
        response.data?.membersCanManageMembers === true,
      );

      setIsFamilyOwner(response.data?.isFamilyOwner === true);
    } catch (error) {
      console.error("Error loading family settings:", error);

      /*
       * SECURITY FIRST:
       *
       * If settings cannot be loaded,
       * do not allow management controls.
       */

      setMembersCanManageMembers(false);

      setIsFamilyOwner(false);
    } finally {
      setSettingsLoading(false);
    }
  };

  /*
   * ============================================================
   * FORM CHANGE
   * ============================================================
   */

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  /*
   * ============================================================
   * ADD MEMBER
   * ============================================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    /*
     * Owner OR permission enabled.
     */

    if (!canManageMembers) {
      alert("You do not have permission to manage family members.");

      return;
    }

    if (!formData.fullName.trim()) {
      alert("Please enter the member's name.");

      return;
    }

    try {
      setSaving(true);

      let uploadedImagePath = "";

      /*
       * ========================================================
       * UPLOAD IMAGE
       * ========================================================
       */

      if (selectedFile) {
        const imageData = new FormData();

        imageData.append("file", selectedFile);

        const uploadResponse = await api.post("/api/members/upload", imageData);

        uploadedImagePath = uploadResponse.data;
      }

      /*
       * ========================================================
       * CREATE MEMBER
       * ========================================================
       */

      await api.post("/api/members", {
        ...formData,

        imagePath: uploadedImagePath,
      });

      alert("Member added successfully.");

      /*
       * ========================================================
       * RESET FORM
       * ========================================================
       */

      setFormData({
        fullName: "",
        gender: "",
        dateOfBirth: "",
        biography: "",
        occupation: "",
        imagePath: "",
      });

      setSelectedFile(null);

      const fileInput = document.getElementById("member-image");

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to manage family members.");

        await fetchFamilySettings();

        return;
      }

      alert(error.response?.data?.message || "Unable to add member.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * START EDIT
   * ============================================================
   */

  const startEdit = (member) => {
    if (!canManageMembers) {
      alert("You do not have permission to manage family members.");

      return;
    }

    setEditingMember(member);

    setEditData({
      fullName: member.fullName || "",

      gender: member.gender || "",

      dateOfBirth: member.dateOfBirth || "",

      biography: member.biography || "",

      occupation: member.occupation || "",
    });

    setEditFile(null);
  };

  /*
   * ============================================================
   * UPDATE MEMBER
   * ============================================================
   */

  const updateMember = async () => {
    if (!editingMember) {
      return;
    }

    if (!canManageMembers) {
      alert("You do not have permission to manage family members.");

      setEditingMember(null);

      return;
    }

    try {
      setSaving(true);

      let uploadedImagePath = editingMember.imagePath || "";

      /*
       * ========================================================
       * UPLOAD NEW IMAGE
       * ========================================================
       */

      if (editFile) {
        const imageData = new FormData();

        imageData.append("file", editFile);

        const uploadResponse = await api.post("/api/members/upload", imageData);

        uploadedImagePath = uploadResponse.data;
      }

      /*
       * ========================================================
       * UPDATE MEMBER
       * ========================================================
       */

      await api.put(`/api/members/${editingMember.id}`, {
        ...editData,

        imagePath: uploadedImagePath,
      });

      alert("Member updated successfully.");

      setEditingMember(null);

      setEditFile(null);

      await fetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to manage family members.");

        await fetchFamilySettings();

        setEditingMember(null);

        return;
      }

      alert(error.response?.data?.message || "Unable to update member.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * DELETE MEMBER
   * ============================================================
   */

  const deleteMember = async (id) => {
    if (!canManageMembers) {
      alert("You do not have permission to manage family members.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this family member?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/members/${id}`);

      await fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to manage family members.");

        await fetchFamilySettings();

        return;
      }

      alert(error.response?.data?.message || "Unable to delete member.");
    }
  };

  /*
   * ============================================================
   * LEAVE FAMILY
   * ============================================================
   */

  const leaveFamily = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this family?",
    );

    if (!confirmed) return;

    try {
      setLeavingFamily(true);

      await api.post("/api/families/leave");

      alert("You have left the family successfully.");
      navigate("/families");
    } catch (error) {
      console.error("Error leaving family:", error);
      alert(error.response?.data?.message || "Unable to leave the family.");
    } finally {
      setLeavingFamily(false);
    }
  };

  /*
   * ============================================================
   * REMOVE MEMBER FROM FAMILY
   * ============================================================
   */

  const removeMemberFromFamily = async (member) => {
    if (!isFamilyOwner) {
      alert("Only the family owner can remove members.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.fullName} from this family?`,
    );

    if (!confirmed) return;

    try {
      setRemovingMemberId(member.id);

      await api.delete(`/api/families/members/${member.id}`);

      alert("Member removed from the family successfully.");
      await fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      alert(
        error.response?.data?.message ||
          "Unable to remove the member from the family.",
      );
    } finally {
      setRemovingMemberId(null);
    }
  };

  /*
   * ============================================================
   * FILTER MEMBERS
   * ============================================================
   */

  const filteredMembers = members.filter((member) => {
    const name = member.fullName || "";

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === "" || member.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading || settingsLoading) {
    return (
      <div className="members-page">
        <div className="members-loading">
          <div className="loading-spinner"></div>

          <h2>Loading Family Members...</h2>

          <p>Please wait while we load your family workspace.</p>
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
    <div className="members-page">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="members-header">
        <div>
          <span className="members-eyebrow">FAMILY DIRECTORY</span>

          <h1>Manage Family Members</h1>

          <p>Add, manage and explore the people who make your family unique.</p>
        </div>

        <div className="member-count">
          <strong>{members.length}</strong>

          <span>Members</span>
        </div>
      </div>

      <div className="family-member-page-actions">
        <button
          type="button"
          className="leave-family-button"
          onClick={leaveFamily}
          disabled={leavingFamily}
        >
          {leavingFamily ? "Leaving..." : "Leave Family"}
        </button>
      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="members-error">
          <strong>Something went wrong</strong>

          <p>{error}</p>

          <button
            onClick={() => {
              fetchMembers();

              fetchFamilySettings();
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ======================================================
          PERMISSION INFORMATION
      ======================================================= */}

      {!canManageMembers && (
        <div className="members-permission-notice">
          <span>🔒</span>

          <div>
            <strong>Member management is restricted</strong>

            <p>
              Your family settings currently do not allow normal family members
              to add, edit, or delete family members.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          OWNER INFORMATION
      ======================================================= */}

      {isFamilyOwner && (
        <div className="members-permission-notice">
          <span>👑</span>

          <div>
            <strong>Family Owner</strong>

            <p>
              As the family owner, you can manage family members regardless of
              the "Members Can Manage Members" setting.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          SEARCH + FILTER
      ======================================================= */}

      <div className="members-toolbar">
        <div className="search-wrapper">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search family members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="">All Genders</option>

          <option value="Male">Male</option>

          <option value="Female">Female</option>
        </select>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <div className="member-layout">
        {/* ====================================================
            ADD MEMBER
        ===================================================== */}

        {canManageMembers ? (
          <div className="member-form">
            <div className="form-header">
              <span className="form-icon">👤</span>

              <div>
                <h2>Add New Member</h2>

                <p>Add someone to your family tree.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>
              </select>

              <label>Date of Birth</label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              <label>Biography</label>

              <textarea
                name="biography"
                placeholder="Tell us about this family member..."
                value={formData.biography}
                onChange={handleChange}
                rows="4"
              />

              <label>Occupation</label>

              <input
                type="text"
                name="occupation"
                placeholder="e.g. Teacher, Engineer"
                value={formData.occupation}
                onChange={handleChange}
              />

              <label>Profile Photo</label>

              <input
                id="member-image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <button
                type="submit"
                disabled={saving}
                className="add-member-button"
              >
                {saving ? "Adding Member..." : "＋ Add Member"}
              </button>
            </form>
          </div>
        ) : (
          <div className="member-form member-form-restricted">
            <div className="form-header">
              <span className="form-icon">🔒</span>

              <div>
                <h2>Member Management</h2>

                <p>Adding new family members is currently restricted.</p>
              </div>
            </div>

            <div className="restricted-management-content">
              <div className="restricted-icon">🔐</div>

              <h3>Permission Required</h3>

              <p>
                A family owner can enable
                <strong>{" Members Can Manage Members "}</strong>
                from Family Settings.
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            MEMBER GRID
        ===================================================== */}

        <div className="member-section">
          <div className="member-section-header">
            <div>
              <span>YOUR FAMILY</span>

              <h2>Family Members</h2>
            </div>

            <p>
              {filteredMembers.length} result
              {filteredMembers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="empty-members">
              <div className="empty-icon">👨‍👩‍👧‍👦</div>

              <h2>No members found</h2>

              <p>Try changing your search or add a new family member.</p>
            </div>
          ) : (
            <div className="member-grid">
              {filteredMembers.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-image-wrapper">
                    {member.imagePath ? (
                      <img
                        src={`http://localhost:8080/uploads/${member.imagePath}`}
                        alt={member.fullName}
                      />
                    ) : (
                      <div className="member-placeholder">
                        {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  <div className="member-card-body">
                    <h3>{member.fullName}</h3>

                    <p className="member-occupation">
                      {member.occupation || "Family Member"}
                    </p>

                    <div className="member-meta">
                      {member.gender && <span>{member.gender}</span>}

                      {member.dateOfBirth && <span>{member.dateOfBirth}</span>}
                    </div>

                    <div className="member-actions">
                      <button
                        className="view-button"
                        onClick={() => navigate(`/member/${member.id}`)}
                      >
                        View Profile
                      </button>

                      {canManageMembers && (
                        <>
                          <button
                            className="edit-button"
                            onClick={() => startEdit(member)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => deleteMember(member.id)}
                          >
                            Delete
                          </button>

                          {isFamilyOwner && !member.isOwner && (
                            <button
                              className="remove-member-button"
                              onClick={() => removeMemberFromFamily(member)}
                              disabled={removingMemberId === member.id}
                            >
                              {removingMemberId === member.id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          EDIT MODAL
      ======================================================= */}

      {editingMember && canManageMembers && (
        <div className="edit-modal">
          <div className="edit-content">
            <div className="edit-header">
              <div>
                <span>FAMILY MEMBER</span>

                <h2>Edit Member</h2>
              </div>

              <button
                className="close-modal"
                onClick={() => setEditingMember(null)}
              >
                ×
              </button>
            </div>

            {/* ==================================================
                  PHOTO
              ================================================== */}

            <div className="edit-photo">
              {editingMember.imagePath ? (
                <img
                  src={`http://localhost:8080/uploads/${editingMember.imagePath}`}
                  alt={editingMember.fullName}
                />
              ) : (
                <div className="edit-placeholder">
                  {editingMember.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <label>Change Photo</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditFile(e.target.files[0])}
            />

            <label>Full Name</label>

            <input
              type="text"
              value={editData.fullName}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  fullName: e.target.value,
                })
              }
            />

            <label>Gender</label>

            <select
              value={editData.gender}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  gender: e.target.value,
                })
              }
            >
              <option value="">Select Gender</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>
            </select>

            <label>Date of Birth</label>

            <input
              type="date"
              value={editData.dateOfBirth || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  dateOfBirth: e.target.value,
                })
              }
            />

            <label>Biography</label>

            <textarea
              value={editData.biography}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  biography: e.target.value,
                })
              }
              rows="4"
            />

            <label>Occupation</label>

            <input
              type="text"
              value={editData.occupation}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  occupation: e.target.value,
                })
              }
            />

            <div className="edit-actions">
              <button
                className="cancel-button"
                onClick={() => setEditingMember(null)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="save-button"
                onClick={updateMember}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersPage;
