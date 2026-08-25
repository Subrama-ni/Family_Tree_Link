import { useEffect, useState } from "react";
import axios from "axios";

function RelationshipsPage() {
  const [members, setMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [family, setFamily] = useState(null);

  const [customRelationship, setCustomRelationship] = useState("");
  const [editingRelationship, setEditingRelationship] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * ============================================================
   * RECIPROCAL RELATIONSHIP SUGGESTION
   * ============================================================
   */

  const [reciprocalSuggestion, setReciprocalSuggestion] = useState(null);

  const relationshipTypes = [
    "Father",
    "Mother",

    "Husband",
    "Wife",

    "Son",
    "Daughter",

    "Brother",
    "Sister",

    "Grandfather",
    "Grandmother",

    "Grandson",
    "Granddaughter",

    "Uncle",
    "Aunt",

    "Nephew",
    "Niece",

    "Cousin",

    "Other",
  ];

  const [formData, setFormData] = useState({
    memberOneId: "",
    relationshipType: "",
    memberTwoId: "",
  });

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setLoading(true);

    await Promise.all([fetchFamily(), fetchMembers(), fetchRelationships()]);

    setLoading(false);
  };

  /*
   * ============================================================
   * GET CURRENT FAMILY
   * ============================================================
   */

  const fetchFamily = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/families/current",
      );

      setFamily(response.data);
    } catch (error) {
      console.log("Family loading error:", error);

      setErrorMessage("Unable to load the current family.");
    }
  };

  /*
   * ============================================================
   * GET CURRENT FAMILY MEMBERS
   * ============================================================
   */

  const fetchMembers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/members");

      setMembers(response.data);
    } catch (error) {
      console.log("Members loading error:", error);

      setErrorMessage("Unable to load family members.");
    }
  };

  /*
   * ============================================================
   * GET CURRENT FAMILY RELATIONSHIPS
   * ============================================================
   */

  const fetchRelationships = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/relationships",
      );

      console.log("Relationships received:", response.data);

      setRelationships(response.data);
    } catch (error) {
      console.log("Relationships loading error:", error);

      setRelationships([]);

      setErrorMessage("Unable to load relationships.");
    }
  };

  /*
   * ============================================================
   * FORM CHANGE
   * ============================================================
   */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");

    if (name === "relationshipType" && value !== "Other") {
      setCustomRelationship("");
    }
  };

  /*
   * ============================================================
   * RESET FORM
   * ============================================================
   */

  const resetForm = () => {
    setFormData({
      memberOneId: "",
      relationshipType: "",
      memberTwoId: "",
    });

    setCustomRelationship("");
    setEditingRelationship(null);
    setErrorMessage("");
  };

  /*
   * ============================================================
   * VALIDATE FORM
   * ============================================================
   */

  const validateForm = () => {
    if (
      !formData.memberOneId ||
      !formData.memberTwoId ||
      !formData.relationshipType
    ) {
      setErrorMessage("Please select both family members and a relationship.");

      return false;
    }

    if (formData.memberOneId === formData.memberTwoId) {
      setErrorMessage(
        "A family member cannot have a relationship with themselves.",
      );

      return false;
    }

    if (formData.relationshipType === "Other" && !customRelationship.trim()) {
      setErrorMessage("Please enter the custom relationship.");

      return false;
    }

    return true;
  };

  /*
   * ============================================================
   * GET FINAL RELATIONSHIP TYPE
   * ============================================================
   */

  const getRelationshipType = () => {
    if (formData.relationshipType === "Other") {
      return customRelationship.trim();
    }

    return formData.relationshipType;
  };

  /*
   * ============================================================
   * GET MEMBER BY ID
   * ============================================================
   */

  const getMemberById = (id) => {
    return members.find((member) => member.id === Number(id));
  };

  /*
   * ============================================================
   * GET GENDER
   * ============================================================
   */

  const getGender = (member) => {
    if (!member?.gender) {
      return "";
    }

    return member.gender.toLowerCase();
  };

  /*
   * ============================================================
   * GET RECIPROCAL RELATIONSHIP
   *
   * Example:
   *
   * Father → child
   *
   * Child gender determines:
   *
   * male   → Son
   * female → Daughter
   *
   * ============================================================
   */

  const getReciprocalRelationship = (
    relationshipType,
    memberOne,
    memberTwo,
  ) => {
    const firstGender = getGender(memberOne);

    const secondGender = getGender(memberTwo);

    switch (relationshipType) {
      /*
       * Parent → Child
       */

      case "Father":
      case "Mother":
        if (secondGender === "male") {
          return "Son";
        }

        if (secondGender === "female") {
          return "Daughter";
        }

        return null;

      /*
       * Husband / Wife
       */

      case "Husband":
        return "Wife";

      case "Wife":
        return "Husband";

      /*
       * Child → Parent
       */

      case "Son":
      case "Daughter":
        if (secondGender === "male") {
          return "Son";
        }

        if (secondGender === "female") {
          return "Daughter";
        }

        return null;

      /*
       * Brother / Sister
       */

      case "Brother":
      case "Sister":
        if (secondGender === "male") {
          return "Brother";
        }

        if (secondGender === "female") {
          return "Sister";
        }

        return null;

      /*
       * Grandparents
       */

      case "Grandfather":
      case "Grandmother":
        if (secondGender === "male") {
          return "Grandson";
        }

        if (secondGender === "female") {
          return "Granddaughter";
        }

        return null;

      /*
       * Grandchildren
       */

      case "Grandson":
      case "Granddaughter":
        if (secondGender === "male") {
          return "Grandfather";
        }

        if (secondGender === "female") {
          return "Grandmother";
        }

        return null;

      /*
       * Uncle / Aunt
       */

      case "Uncle":
      case "Aunt":
        if (secondGender === "male") {
          return "Nephew";
        }

        if (secondGender === "female") {
          return "Niece";
        }

        return null;

      /*
       * Nephew / Niece
       */

      case "Nephew":
      case "Niece":
        if (secondGender === "male") {
          return "Uncle";
        }

        if (secondGender === "female") {
          return "Aunt";
        }

        return null;

      /*
       * Cousin
       */

      case "Cousin":
        return "Cousin";

      /*
       * Other
       */

      case "Other":
      default:
        return null;
    }
  };

  /*
   * ============================================================
   * CHECK DUPLICATE RELATIONSHIP
   *
   * Only exact duplicates are blocked.
   *
   * Muniyappa → Husband → Pulamma
   *
   * and
   *
   * Pulamma → Wife → Muniyappa
   *
   * are both allowed.
   * ============================================================
   */

  const isDuplicateRelationship = (
    memberOneId,
    relationshipType,
    memberTwoId,
  ) => {
    const type = relationshipType.toLowerCase();

    return relationships.some((relationship) => {
      if (editingRelationship && relationship.id === editingRelationship.id) {
        return false;
      }

      return (
        relationship.memberOne?.id === Number(memberOneId) &&
        relationship.memberTwo?.id === Number(memberTwoId) &&
        relationship.relationshipType?.toLowerCase() === type
      );
    });
  };

  /*
   * ============================================================
   * CREATE RELATIONSHIP
   * ============================================================
   */

  const createRelationship = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setReciprocalSuggestion(null);

    if (!validateForm()) {
      return;
    }

    const relationshipType = getRelationshipType();

    if (
      isDuplicateRelationship(
        formData.memberOneId,
        relationshipType,
        formData.memberTwoId,
      )
    ) {
      setErrorMessage("This exact relationship already exists.");

      return;
    }

    try {
      setSaving(true);

      const memberOne = getMemberById(formData.memberOneId);

      const memberTwo = getMemberById(formData.memberTwoId);

      const requestBody = {
        relationshipType,

        memberOne: {
          id: Number(formData.memberOneId),
        },

        memberTwo: {
          id: Number(formData.memberTwoId),
        },
      };

      console.log("Creating relationship:", requestBody);

      await axios.post("http://localhost:8080/api/relationships", requestBody);

      /*
       * Determine reciprocal relationship
       */

      const reciprocalType = getReciprocalRelationship(
        relationshipType,
        memberOne,
        memberTwo,
      );

      /*
       * Save suggestion BEFORE clearing
       * the form.
       */

      if (
        reciprocalType &&
        !isDuplicateRelationship(
          formData.memberTwoId,
          reciprocalType,
          formData.memberOneId,
        )
      ) {
        setReciprocalSuggestion({
          memberOneId: Number(formData.memberTwoId),

          memberOneName: memberTwo?.fullName,

          relationshipType: reciprocalType,

          memberTwoId: Number(formData.memberOneId),

          memberTwoName: memberOne?.fullName,
        });
      }

      resetForm();

      setSuccessMessage("Relationship created successfully!");

      await fetchRelationships();
    } catch (error) {
      console.log("Create relationship error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to create relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * ADD RECIPROCAL RELATIONSHIP
   * ============================================================
   */

  const addReciprocalRelationship = async () => {
    if (!reciprocalSuggestion) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const requestBody = {
        relationshipType: reciprocalSuggestion.relationshipType,

        memberOne: {
          id: reciprocalSuggestion.memberOneId,
        },

        memberTwo: {
          id: reciprocalSuggestion.memberTwoId,
        },
      };

      await axios.post("http://localhost:8080/api/relationships", requestBody);

      setReciprocalSuggestion(null);

      setSuccessMessage(
        "Both family relationships have been added successfully!",
      );

      await fetchRelationships();
    } catch (error) {
      console.log("Reciprocal relationship error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to add reciprocal relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * SKIP RECIPROCAL
   * ============================================================
   */

  const skipReciprocalRelationship = () => {
    setReciprocalSuggestion(null);
  };

  /*
   * ============================================================
   * START EDIT
   * ============================================================
   */

  const startEdit = (relationship) => {
    setReciprocalSuggestion(null);

    setEditingRelationship(relationship);

    const isCustomRelationship = !relationshipTypes.includes(
      relationship.relationshipType,
    );

    setFormData({
      memberOneId: relationship.memberOne.id.toString(),

      relationshipType: isCustomRelationship
        ? "Other"
        : relationship.relationshipType,

      memberTwoId: relationship.memberTwo.id.toString(),
    });

    if (isCustomRelationship) {
      setCustomRelationship(relationship.relationshipType);
    } else {
      setCustomRelationship("");
    }

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ============================================================
   * UPDATE RELATIONSHIP
   * ============================================================
   */

  const updateRelationship = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    const relationshipType = getRelationshipType();

    if (
      isDuplicateRelationship(
        formData.memberOneId,
        relationshipType,
        formData.memberTwoId,
      )
    ) {
      setErrorMessage("This exact relationship already exists.");

      return;
    }

    try {
      setSaving(true);

      const requestBody = {
        relationshipType,

        memberOne: {
          id: Number(formData.memberOneId),
        },

        memberTwo: {
          id: Number(formData.memberTwoId),
        },
      };

      await axios.put(
        `http://localhost:8080/api/relationships/${editingRelationship.id}`,
        requestBody,
      );

      resetForm();

      setSuccessMessage("Relationship updated successfully!");

      await fetchRelationships();
    } catch (error) {
      console.log("Update relationship error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to update relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * DELETE RELATIONSHIP
   * ============================================================
   */

  const deleteRelationship = async (id) => {
    if (!window.confirm("Are you sure you want to delete this relationship?")) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await axios.delete(`http://localhost:8080/api/relationships/${id}`);

      setSuccessMessage("Relationship deleted successfully!");

      await fetchRelationships();
    } catch (error) {
      console.log("Delete relationship error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to delete relationship.",
      );
    }
  };

  /*
   * ============================================================
   * GET MEMBER NAME
   * ============================================================
   */

  const getMemberName = (id) => {
    const member = members.find((member) => member.id === Number(id));

    return member ? member.fullName : "Unknown Member";
  };

  /*
   * ============================================================
   * FORM VALID STATE
   * ============================================================
   */

  const isFormReady =
    formData.memberOneId &&
    formData.relationshipType &&
    formData.memberTwoId &&
    formData.memberOneId !== formData.memberTwoId &&
    (formData.relationshipType !== "Other" || customRelationship.trim());

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="relationships-page">
        <div className="relationship-loading">
          <div className="loading-tree">🌳</div>

          <h2>Loading Family Relationships...</h2>

          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="relationships-page">
      {/* =====================================================
          HERO
          ===================================================== */}

      <div className="relationships-hero">
        <div className="hero-tree">🌳</div>

        <h1>Relationship Management</h1>

        <p>
          Build and manage the connections that make your family tree complete.
        </p>
      </div>

      {/* =====================================================
          CURRENT FAMILY
          ===================================================== */}

      {family && (
        <div className="current-family">
          <div className="family-icon">🌳</div>

          <div className="family-info">
            <strong>{family.name}</strong>

            <p>Manage relationships within your family</p>
          </div>

          <div className="family-member-count">
            <span>{members.length}</span>

            <small>Members</small>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
          ===================================================== */}

      {successMessage && (
        <div className="relationship-success">
          <span>✓</span>

          {successMessage}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
          ===================================================== */}

      {errorMessage && (
        <div className="relationship-error">
          <span>!</span>

          {errorMessage}
        </div>
      )}

      {/* =====================================================
          RECIPROCAL SUGGESTION
          ===================================================== */}

      {reciprocalSuggestion && (
        <div className="reciprocal-suggestion">
          <div className="reciprocal-icon">🔗</div>

          <div className="reciprocal-content">
            <h3>Add the corresponding relationship?</h3>

            <p>Family relationships usually work in both directions.</p>

            <div className="reciprocal-preview">
              <span className="reciprocal-person">
                {reciprocalSuggestion.memberOneName}
              </span>

              <span className="reciprocal-arrow">→</span>

              <span className="reciprocal-badge">
                {reciprocalSuggestion.relationshipType}
              </span>

              <span className="reciprocal-arrow">→</span>

              <span className="reciprocal-person">
                {reciprocalSuggestion.memberTwoName}
              </span>
            </div>

            <div className="reciprocal-actions">
              <button
                className="reciprocal-add-btn"
                onClick={addReciprocalRelationship}
                disabled={saving}
              >
                {saving ? "Adding..." : "✓ Add Relationship"}
              </button>

              <button
                className="reciprocal-skip-btn"
                onClick={skipReciprocalRelationship}
                disabled={saving}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM
          ===================================================== */}

      <div
        className={`relationship-form ${
          editingRelationship ? "editing-form" : ""
        }`}
      >
        <div className="form-heading">
          <div className="form-icon">{editingRelationship ? "✏️" : "🔗"}</div>

          <div>
            <h2>
              {editingRelationship ? "Edit Relationship" : "Add Relationship"}
            </h2>

            <p>
              {editingRelationship
                ? "Update this family connection"
                : "Connect two members of your family"}
            </p>
          </div>
        </div>

        <div className="relationship-form-grid">
          {/* MEMBER ONE */}

          <div className="relationship-field">
            <label>First Family Member</label>

            <select
              name="memberOneId"
              value={formData.memberOneId}
              onChange={handleChange}
            >
              <option value="">Select Member</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* RELATIONSHIP */}

          <div className="relationship-field">
            <label>Relationship</label>

            <select
              name="relationshipType"
              value={formData.relationshipType}
              onChange={handleChange}
            >
              <option value="">Select Relationship</option>

              {relationshipTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* MEMBER TWO */}

          <div className="relationship-field">
            <label>Related Family Member</label>

            <select
              name="memberTwoId"
              value={formData.memberTwoId}
              onChange={handleChange}
            >
              <option value="">Select Member</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CUSTOM RELATIONSHIP */}

        {formData.relationshipType === "Other" && (
          <div className="custom-relationship-wrapper">
            <label>Custom Relationship</label>

            <input
              type="text"
              placeholder="Example: Family Friend"
              value={customRelationship}
              onChange={(e) => setCustomRelationship(e.target.value)}
            />
          </div>
        )}

        {/* PREVIEW */}

        {isFormReady && (
          <div className="relationship-preview">
            <span className="preview-member">
              {getMemberName(formData.memberOneId)}
            </span>

            <span className="preview-line">→</span>

            <span className="preview-type">{getRelationshipType()}</span>

            <span className="preview-line">→</span>

            <span className="preview-member">
              {getMemberName(formData.memberTwoId)}
            </span>
          </div>
        )}

        {/* BUTTONS */}

        <div className="relationship-form-buttons">
          {editingRelationship ? (
            <>
              <button
                className="primary-action"
                onClick={updateRelationship}
                disabled={!isFormReady || saving}
              >
                {saving ? "Updating..." : "✓ Update Relationship"}
              </button>

              <button
                className="secondary-action"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="primary-action"
              onClick={createRelationship}
              disabled={!isFormReady || saving}
            >
              {saving ? "Creating..." : "＋ Create Relationship"}
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          EXISTING RELATIONSHIPS
          ===================================================== */}

      <div className="relationship-list">
        <div className="relationship-list-heading">
          <div>
            <h2>Family Connections</h2>

            <p>
              {relationships.length} relationship
              {relationships.length !== 1 ? "s" : ""} in your family tree
            </p>
          </div>

          <div className="connection-count">🔗 {relationships.length}</div>
        </div>

        {relationships.length === 0 ? (
          <div className="empty-relationships">
            <div>🌱</div>

            <h3>No relationships yet</h3>

            <p>Start connecting your family members above.</p>
          </div>
        ) : (
          <div className="relationship-cards">
            {relationships.map((relationship, index) => (
              <div
                key={relationship.id}
                className="relationship-card"
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                <div className="relationship-person">
                  <div className="person-avatar">
                    {relationship.memberOne?.fullName?.charAt(0)?.toUpperCase()}
                  </div>

                  <strong>{relationship.memberOne?.fullName}</strong>
                </div>

                <div className="relationship-connection">
                  <span className="connection-line">→</span>

                  <span className="relationship-badge">
                    {relationship.relationshipType}
                  </span>

                  <span className="connection-line">→</span>
                </div>

                <div className="relationship-person">
                  <div className="person-avatar">
                    {relationship.memberTwo?.fullName?.charAt(0)?.toUpperCase()}
                  </div>

                  <strong>{relationship.memberTwo?.fullName}</strong>
                </div>

                <div className="relationship-actions">
                  <button
                    className="edit-btn"
                    onClick={() => startEdit(relationship)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteRelationship(relationship.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelationshipsPage;
