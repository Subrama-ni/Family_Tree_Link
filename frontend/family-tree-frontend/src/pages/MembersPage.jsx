import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function MembersPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [genderFilter, setGenderFilter] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [editingMember, setEditingMember] = useState(null);

  const [editFile, setEditFile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    biography: "",
    occupation: "",
    imagePath: "",
  });

  const [editData, setEditData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    biography: "",
    occupation: "",
  });

  /*
   * ============================================================
   * FETCH MEMBERS
   * ============================================================
   */

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await api.get("/api/members");

      setMembers(response.data);
    } catch (error) {
      console.error("Error loading members:", error);

      setError("Unable to load family members.");
    } finally {
      setLoading(false);
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

    if (!formData.fullName.trim()) {
      alert("Please enter the member's name.");

      return;
    }

    try {
      setSaving(true);

      let uploadedImagePath = "";

      /*
       * Upload image first.
       */

      if (selectedFile) {
        const imageData = new FormData();

        imageData.append("file", selectedFile);

        const uploadResponse = await api.post("/api/members/upload", imageData);

        uploadedImagePath = uploadResponse.data;
      }

      /*
       * Create member.
       *
       * IMPORTANT:
       *
       * We do NOT send family.
       *
       * Backend assigns the current
       * user's family.
       */

      await api.post("/api/members", {
        ...formData,

        imagePath: uploadedImagePath,
      });

      alert("Member added successfully.");

      /*
       * Reset form.
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

      /*
       * Reset file input.
       */

      const fileInput = document.getElementById("member-image");

      if (fileInput) {
        fileInput.value = "";
      }

      /*
       * Refresh members.
       */

      await fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);

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

    try {
      setSaving(true);

      let uploadedImagePath = editingMember.imagePath || "";

      /*
       * Upload new image only if
       * user selected one.
       */

      if (editFile) {
        const imageData = new FormData();

        imageData.append("file", editFile);

        const uploadResponse = await api.post("/api/members/upload", imageData);

        uploadedImagePath = uploadResponse.data;
      }

      /*
       * Update member.
       *
       * Family is NOT sent.
       *
       * Backend protects family ownership.
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

      alert(error.response?.data?.message || "Unable to delete member.");
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

  if (loading) {
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

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="members-error">
          <strong>Something went wrong</strong>

          <p>{error}</p>

          <button onClick={fetchMembers}>Try Again</button>
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

      {editingMember && (
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

            {/* PHOTO */}

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
