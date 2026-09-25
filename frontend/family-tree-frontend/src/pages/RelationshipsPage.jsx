import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RelationshipsPage.css";

function RelationshipsPage() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [members, setMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [family, setFamily] = useState(null);

  const [isFamilyOwner, setIsFamilyOwner] = useState(false);
  const [membersCanManageMembers, setMembersCanManageMembers] = useState(false);

  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingRelationship, setEditingRelationship] = useState(null);

  /*
   * Suggested reverse relationship.
   *
   * Example:
   *
   * Ravi -> Father -> Priya
   *
   * Suggest:
   *
   * Priya -> Daughter -> Ravi
   */
  const [relationshipSuggestion, setRelationshipSuggestion] = useState(null);

  const [formData, setFormData] = useState({
    memberOneId: "",
    relationshipType: "",
    memberTwoId: "",
  });

  const [customRelationship, setCustomRelationship] = useState("");

  const canManageRelationships = isFamilyOwner || membersCanManageMembers;

  // ============================================================
  // RELATIONSHIP TYPES
  // ============================================================

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

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadPage();
  }, []);

  // ============================================================
  // LOAD PAGE
  // ============================================================

  const loadPage = async () => {
    setLoading(true);

    await Promise.all([
      fetchFamily(),
      fetchMembers(),
      fetchRelationships(),
      fetchFamilySettings(),
    ]);

    setLoading(false);
  };

  // ============================================================
  // FETCH FAMILY
  // ============================================================

  const fetchFamily = async () => {
    try {
      const response = await api.get("/api/families/current");
      setFamily(response.data);
    } catch (error) {
      console.error("Family loading error:", error);
    }
  };

  // ============================================================
  // FETCH MEMBERS
  // ============================================================

  const fetchMembers = async () => {
    try {
      const response = await api.get("/api/members");

      setMembers(response.data || []);
    } catch (error) {
      console.error("Members loading error:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to load family members.",
      );
    }
  };

  // ============================================================
  // FETCH RELATIONSHIPS
  // ============================================================

  const fetchRelationships = async () => {
    try {
      const response = await api.get("/api/relationships");

      setRelationships(response.data || []);
    } catch (error) {
      console.error("Relationships loading error:", error);

      setRelationships([]);

      setErrorMessage(
        error.response?.data?.message || "Unable to load relationships.",
      );
    }
  };

  // ============================================================
  // FETCH FAMILY SETTINGS
  // ============================================================

  const fetchFamilySettings = async () => {
    try {
      setSettingsLoading(true);

      const response = await api.get("/api/families/settings");

      setIsFamilyOwner(response.data?.isFamilyOwner === true);

      setMembersCanManageMembers(
        response.data?.membersCanManageMembers === true,
      );
    } catch (error) {
      console.error("Family settings loading error:", error);

      setIsFamilyOwner(false);
      setMembersCanManageMembers(false);
    } finally {
      setSettingsLoading(false);
    }
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
    setRelationshipSuggestion(null);
  };

  // ============================================================
  // RESET FORM
  // ============================================================

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

  // ============================================================
  // GET MEMBER
  // ============================================================

  const getMember = (id) => {
    return members.find((member) => Number(member.id) === Number(id));
  };

  // ============================================================
  // GET MEMBER NAME
  // ============================================================

  const getMemberName = (id) => {
    const member = getMember(id);

    return member?.fullName || "Unknown Member";
  };

  // ============================================================
  // GET MEMBER GENDER
  // ============================================================

  const getMemberGender = (id) => {
    const member = getMember(id);

    return member?.gender?.toLowerCase() || "";
  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    if (!formData.memberOneId) {
      setErrorMessage("Please select Member 1.");
      return false;
    }

    if (!formData.relationshipType) {
      setErrorMessage("Please select a relationship.");
      return false;
    }

    if (!formData.memberTwoId) {
      setErrorMessage("Please select Member 2.");
      return false;
    }

    if (Number(formData.memberOneId) === Number(formData.memberTwoId)) {
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

  // ============================================================
  // GET FINAL RELATIONSHIP TYPE
  // ============================================================

  const getRelationshipType = () => {
    if (formData.relationshipType === "Other") {
      return customRelationship.trim();
    }

    return formData.relationshipType;
  };

  // ============================================================
  // CHECK EXACT DUPLICATE
  // ============================================================

  const isDuplicateRelationship = () => {
    const relationshipType = getRelationshipType().trim().toLowerCase();

    return relationships.some((relationship) => {
      if (editingRelationship && relationship.id === editingRelationship.id) {
        return false;
      }

      return (
        Number(relationship.memberOne?.id) === Number(formData.memberOneId) &&
        Number(relationship.memberTwo?.id) === Number(formData.memberTwoId) &&
        relationship.relationshipType?.trim().toLowerCase() === relationshipType
      );
    });
  };

  // ============================================================
  // CHECK WHETHER RELATIONSHIP EXISTS
  // ============================================================

  const relationshipExists = (memberOneId, memberTwoId, relationshipType) => {
    return relationships.some((relationship) => {
      return (
        Number(relationship.memberOne?.id) === Number(memberOneId) &&
        Number(relationship.memberTwo?.id) === Number(memberTwoId) &&
        relationship.relationshipType?.trim().toLowerCase() ===
          relationshipType.trim().toLowerCase()
      );
    });
  };

  // ============================================================
  // GET GENDER-AWARE RECIPROCAL RELATIONSHIP
  // ============================================================

  const getReciprocalRelationship = (relationshipType, reverseMemberId) => {
    const type = relationshipType?.trim().toLowerCase();

    const reverseGender = getMemberGender(reverseMemberId);

    /*
     * ----------------------------------------------------------
     * SPOUSE
     * ----------------------------------------------------------
     */

    if (type === "husband") {
      return "Wife";
    }

    if (type === "wife") {
      return "Husband";
    }

    /*
     * ----------------------------------------------------------
     * PARENT -> CHILD
     * ----------------------------------------------------------
     *
     * Father -> Son/Daughter
     * Mother -> Son/Daughter
     */

    if (type === "father" || type === "mother") {
      if (reverseGender === "female") {
        return "Daughter";
      }

      return "Son";
    }

    /*
     * ----------------------------------------------------------
     * CHILD -> PARENT
     * ----------------------------------------------------------
     *
     * Son/Daughter -> Father/Mother
     */

    if (type === "son" || type === "daughter") {
      if (reverseGender === "female") {
        return "Mother";
      }

      return "Father";
    }

    /*
     * ----------------------------------------------------------
     * SIBLINGS
     * ----------------------------------------------------------
     */

    if (type === "brother" || type === "sister") {
      if (reverseGender === "female") {
        return "Sister";
      }

      return "Brother";
    }

    /*
     * ----------------------------------------------------------
     * GRANDPARENT -> GRANDCHILD
     * ----------------------------------------------------------
     */

    if (type === "grandfather" || type === "grandmother") {
      if (reverseGender === "female") {
        return "Granddaughter";
      }

      return "Grandson";
    }

    /*
     * ----------------------------------------------------------
     * GRANDCHILD -> GRANDPARENT
     * ----------------------------------------------------------
     */

    if (type === "grandson" || type === "granddaughter") {
      if (reverseGender === "female") {
        return "Grandmother";
      }

      return "Grandfather";
    }

    /*
     * ----------------------------------------------------------
     * UNCLE / AUNT -> NEPHEW / NIECE
     * ----------------------------------------------------------
     */

    if (type === "uncle" || type === "aunt") {
      if (reverseGender === "female") {
        return "Niece";
      }

      return "Nephew";
    }

    /*
     * ----------------------------------------------------------
     * NEPHEW / NIECE -> UNCLE / AUNT
     * ----------------------------------------------------------
     */

    if (type === "nephew" || type === "niece") {
      if (reverseGender === "female") {
        return "Aunt";
      }

      return "Uncle";
    }

    /*
     * ----------------------------------------------------------
     * COUSIN
     * ----------------------------------------------------------
     */

    if (type === "cousin") {
      return "Cousin";
    }

    /*
     * ----------------------------------------------------------
     * OTHER
     * ----------------------------------------------------------
     *
     * We cannot mathematically know the inverse of a custom
     * relationship, so we preserve the custom relationship and
     * reverse the two members.
     */

    if (type === "other") {
      return "Other";
    }

    /*
     * Custom relationship entered by the user.
     *
     * Example:
     *
     * "Step Father"
     *
     * There is no reliable way to infer "Step Son" or
     * "Step Daughter", so preserve the custom relationship.
     */

    return relationshipType;
  };

  // ============================================================
  // CREATE RECIPROCAL SUGGESTION
  // ============================================================

  const createRelationshipSuggestion = (
    relationshipType,
    memberOneId,
    memberTwoId,
  ) => {
    /*
     * Reverse the members.
     *
     * Original:
     *
     * Member 1 -> Relationship -> Member 2
     *
     * Suggested:
     *
     * Member 2 -> Reverse Relationship -> Member 1
     */

    const reverseMemberOneId = Number(memberTwoId);
    const reverseMemberTwoId = Number(memberOneId);

    const inverseType = getReciprocalRelationship(
      relationshipType,
      reverseMemberOneId,
    );

    if (!inverseType) {
      setRelationshipSuggestion(null);
      return;
    }

    /*
     * For custom "Other" relationships, keep the custom
     * relationship text.
     */
    let finalInverseType = inverseType;

    if (
      relationshipType !== "Other" &&
      !relationshipTypes.includes(inverseType)
    ) {
      finalInverseType = relationshipType;
    }

    /*
     * Don't show the suggestion if the reverse relationship
     * already exists.
     */
    if (
      relationshipExists(
        reverseMemberOneId,
        reverseMemberTwoId,
        finalInverseType,
      )
    ) {
      setRelationshipSuggestion(null);
      return;
    }

    setRelationshipSuggestion({
      memberOneId: reverseMemberOneId,
      memberTwoId: reverseMemberTwoId,
      relationshipType: finalInverseType,
    });
  };

  // ============================================================
  // CREATE RELATIONSHIP
  // ============================================================

  const createRelationship = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setRelationshipSuggestion(null);

    if (!canManageRelationships) {
      setErrorMessage(
        "You do not have permission to manage family relationships.",
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isDuplicateRelationship()) {
      setErrorMessage("This exact relationship already exists.");

      return;
    }

    try {
      setSaving(true);

      const memberOneId = Number(formData.memberOneId);

      const memberTwoId = Number(formData.memberTwoId);

      const relationshipType = getRelationshipType();

      const requestBody = {
        relationshipType,

        memberOne: {
          id: memberOneId,
        },

        memberTwo: {
          id: memberTwoId,
        },
      };

      await api.post("/api/relationships", requestBody);

      /*
       * Refresh relationships before creating the suggestion.
       */
      await fetchRelationships();

      setSuccessMessage("Relationship created successfully!");

      /*
       * Create reverse relationship suggestion
       * for ALL supported relationship types.
       */
      createRelationshipSuggestion(relationshipType, memberOneId, memberTwoId);

      resetForm();
    } catch (error) {
      console.error("Create relationship error:", error);

      if (error.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to manage family relationships.",
        );

        await fetchFamilySettings();

        return;
      }

      setErrorMessage(
        error.response?.data?.message || "Failed to create relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CREATE SUGGESTED RELATIONSHIP
  // ============================================================

  const createSuggestedRelationship = async () => {
    if (!relationshipSuggestion) {
      return;
    }

    try {
      setSaving(true);

      setErrorMessage("");
      setSuccessMessage("");

      /*
       * Check again before inserting.
       */
      const alreadyExists = relationshipExists(
        relationshipSuggestion.memberOneId,
        relationshipSuggestion.memberTwoId,
        relationshipSuggestion.relationshipType,
      );

      if (alreadyExists) {
        setRelationshipSuggestion(null);

        setErrorMessage("This reverse relationship already exists.");

        return;
      }

      const requestBody = {
        relationshipType: relationshipSuggestion.relationshipType,

        memberOne: {
          id: relationshipSuggestion.memberOneId,
        },

        memberTwo: {
          id: relationshipSuggestion.memberTwoId,
        },
      };

      await api.post("/api/relationships", requestBody);

      await fetchRelationships();

      setSuccessMessage("Reverse relationship added successfully!");

      setRelationshipSuggestion(null);
    } catch (error) {
      console.error("Create suggested relationship error:", error);

      if (error.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to manage family relationships.",
        );

        await fetchFamilySettings();

        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create the suggested relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // START EDIT
  // ============================================================

  const startEdit = (relationship) => {
    if (!canManageRelationships) {
      setErrorMessage(
        "You do not have permission to manage family relationships.",
      );

      return;
    }

    const isCustomRelationship = !relationshipTypes.includes(
      relationship.relationshipType,
    );

    setEditingRelationship(relationship);

    setRelationshipSuggestion(null);

    setFormData({
      memberOneId: relationship.memberOne?.id?.toString() || "",

      relationshipType: isCustomRelationship
        ? "Other"
        : relationship.relationshipType,

      memberTwoId: relationship.memberTwo?.id?.toString() || "",
    });

    if (isCustomRelationship) {
      setCustomRelationship(relationship.relationshipType || "");
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

  // ============================================================
  // UPDATE RELATIONSHIP
  // ============================================================

  const updateRelationship = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setRelationshipSuggestion(null);

    if (!canManageRelationships) {
      setErrorMessage(
        "You do not have permission to manage family relationships.",
      );

      setEditingRelationship(null);

      return;
    }

    if (!editingRelationship) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isDuplicateRelationship()) {
      setErrorMessage("This exact relationship already exists.");

      return;
    }

    try {
      setSaving(true);

      const requestBody = {
        relationshipType: getRelationshipType(),

        memberOne: {
          id: Number(formData.memberOneId),
        },

        memberTwo: {
          id: Number(formData.memberTwoId),
        },
      };

      await api.put(
        `/api/relationships/${editingRelationship.id}`,
        requestBody,
      );

      setSuccessMessage("Relationship updated successfully!");

      resetForm();

      await fetchRelationships();
    } catch (error) {
      console.error("Update relationship error:", error);

      if (error.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to manage family relationships.",
        );

        await fetchFamilySettings();

        setEditingRelationship(null);

        return;
      }

      setErrorMessage(
        error.response?.data?.message || "Failed to update relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE RELATIONSHIP
  // ============================================================

  const deleteRelationship = async (id) => {
    if (!canManageRelationships) {
      setErrorMessage(
        "You do not have permission to manage family relationships.",
      );

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this relationship?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await api.delete(`/api/relationships/${id}`);

      setSuccessMessage("Relationship deleted successfully!");

      await fetchRelationships();

      /*
       * If the deleted relationship was the one currently
       * shown in the suggestion, close the suggestion.
       */
      if (
        relationshipSuggestion &&
        relationshipSuggestion.relationshipId === id
      ) {
        setRelationshipSuggestion(null);
      }
    } catch (error) {
      console.error("Delete relationship error:", error);

      if (error.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to manage family relationships.",
        );

        await fetchFamilySettings();

        return;
      }

      setErrorMessage(
        error.response?.data?.message || "Failed to delete relationship.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading || settingsLoading) {
    return (
      <div className="relationships-page">
        <div className="relationships-loading">
          <div className="loading-tree">🌳</div>

          <div className="loading-spinner"></div>

          <h2>Loading your family connections</h2>

          <p>Preparing your family's relationship map...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relationships-page">
      <main className="relationships-container">
        {/* ======================================================
            HERO
        ====================================================== */}

        <header className="relationships-hero">
          <button
            type="button"
            className="relationship-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <span>←</span>
            Back to Dashboard
          </button>

          <div className="relationship-hero-icon">🔗</div>

          <span className="relationships-eyebrow">FAMILY CONNECTIONS</span>

          <h1>
            Build your family's
            <span> story together.</span>
          </h1>

          <p>
            Connect the people in your family tree and preserve the
            relationships that bring your family together across generations.
          </p>
        </header>

        {/* ======================================================
            FAMILY SUMMARY
        ====================================================== */}

        {family && (
          <section className="current-family">
            <div className="current-family-icon">🌳</div>

            <div className="current-family-content">
              <span>YOUR FAMILY</span>

              <strong>{family.name}</strong>

              <p>Family relationships and connections</p>
            </div>

            <div className="family-member-count">
              <strong>{members.length}</strong>

              <span>{members.length === 1 ? "Member" : "Members"}</span>
            </div>
          </section>
        )}

        {/* ======================================================
            MESSAGES
        ====================================================== */}

        {successMessage && (
          <div className="relationship-message success" role="status">
            <span className="message-icon">✓</span>

            <div>
              <strong>Success</strong>
              <p>{successMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="relationship-message error" role="alert">
            <span className="message-icon">!</span>

            <div>
              <strong>Something needs your attention</strong>

              <p>{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        )}

        {/* ======================================================
            PERMISSION
        ====================================================== */}

        {isFamilyOwner && (
          <div className="relationship-permission-notice owner">
            <div className="permission-icon">👑</div>

            <div>
              <strong>Family Owner</strong>

              <p>
                You can create, edit and delete relationships in your family
                tree.
              </p>
            </div>
          </div>
        )}

        {!canManageRelationships && (
          <div className="relationship-permission-notice">
            <div className="permission-icon">🔒</div>

            <div>
              <strong>Relationship management is restricted</strong>

              <p>
                You can view existing relationships, but you cannot create, edit
                or delete them. A family owner can enable
                <strong>{" Members Can Manage Members "}</strong>
                from Family Settings.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            RECIPROCAL SUGGESTION
        ====================================================== */}

        {relationshipSuggestion && canManageRelationships && (
          <section className="relationship-suggestion">
            <div className="suggestion-top">
              <div className="suggestion-icon">💡</div>

              <div>
                <span className="suggestion-label">SMART SUGGESTION</span>

                <h2>Complete the reverse connection</h2>
              </div>

              <button
                type="button"
                className="suggestion-close"
                onClick={() => setRelationshipSuggestion(null)}
                aria-label="Dismiss suggestion"
              >
                ×
              </button>
            </div>

            <div className="suggestion-flow">
              <div className="suggestion-person">
                <div className="suggestion-avatar">
                  {getMemberName(relationshipSuggestion.memberOneId)
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>

                <strong>
                  {getMemberName(relationshipSuggestion.memberOneId)}
                </strong>
              </div>

              <div className="suggestion-relationship">
                <span>{relationshipSuggestion.relationshipType}</span>

                <div>→</div>
              </div>

              <div className="suggestion-person">
                <div className="suggestion-avatar">
                  {getMemberName(relationshipSuggestion.memberTwoId)
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>

                <strong>
                  {getMemberName(relationshipSuggestion.memberTwoId)}
                </strong>
              </div>
            </div>

            <p className="suggestion-description">
              We found the natural reverse relationship for the connection you
              just created. Would you like to add it to your family tree?
            </p>

            <div className="suggestion-actions">
              <button
                type="button"
                className="suggestion-primary"
                onClick={createSuggestedRelationship}
                disabled={saving}
              >
                {saving ? "Creating..." : "✓ Add Reverse Relationship"}
              </button>

              <button
                type="button"
                className="suggestion-secondary"
                onClick={() => setRelationshipSuggestion(null)}
                disabled={saving}
              >
                Not Now
              </button>
            </div>
          </section>
        )}

        {/* ======================================================
            CREATE / EDIT FORM
        ====================================================== */}

        {canManageRelationships && (
          <section className="relationship-form">
            <div className="relationship-form-header">
              <div className="relationship-form-icon">
                {editingRelationship ? "✏️" : "🔗"}
              </div>

              <div>
                <span>
                  {editingRelationship
                    ? "UPDATE CONNECTION"
                    : "CREATE CONNECTION"}
                </span>

                <h2>
                  {editingRelationship
                    ? "Edit Relationship"
                    : "Add a Relationship"}
                </h2>

                <p>Connect two members of your family tree.</p>
              </div>
            </div>

            <div className="relationship-form-grid">
              {/* MEMBER ONE */}

              <div className="relationship-field">
                <label htmlFor="memberOneId">
                  <span className="field-number">01</span>
                  Member 1
                </label>

                <select
                  id="memberOneId"
                  name="memberOneId"
                  value={formData.memberOneId}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Select first family member</option>

                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* RELATIONSHIP */}

              <div className="relationship-field">
                <label htmlFor="relationshipType">
                  <span className="field-number">02</span>
                  Relationship
                </label>

                <select
                  id="relationshipType"
                  name="relationshipType"
                  value={formData.relationshipType}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Select relationship</option>

                  {relationshipTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* MEMBER TWO */}

              <div className="relationship-field">
                <label htmlFor="memberTwoId">
                  <span className="field-number">03</span>
                  Member 2
                </label>

                <select
                  id="memberTwoId"
                  name="memberTwoId"
                  value={formData.memberTwoId}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Select second family member</option>

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
              <div className="relationship-field custom-field">
                <label htmlFor="customRelationship">Custom Relationship</label>

                <input
                  id="customRelationship"
                  type="text"
                  placeholder="Example: Step Father"
                  value={customRelationship}
                  onChange={(event) =>
                    setCustomRelationship(event.target.value)
                  }
                  disabled={saving}
                />
              </div>
            )}

            {/* FORM FOOTER */}

            <div className="relationship-form-footer">
              <div className="relationship-form-tip">
                <span>💡</span>

                <p>
                  <strong>Smart suggestion:</strong> after you create a
                  relationship, Family Tree Link will suggest the corresponding
                  reverse relationship automatically.
                </p>
              </div>

              <div className="relationship-form-buttons">
                {editingRelationship ? (
                  <>
                    <button
                      type="button"
                      className="button-primary"
                      onClick={updateRelationship}
                      disabled={saving}
                    >
                      {saving ? "Updating..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="button-secondary"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="button-primary"
                    onClick={createRelationship}
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "＋ Create Relationship"}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            EXISTING RELATIONSHIPS
        ====================================================== */}

        <section className="relationship-list">
          <div className="relationship-list-header">
            <div>
              <span>YOUR FAMILY</span>

              <h2>Existing Relationships</h2>

              <p>Connections currently recorded in your family tree.</p>
            </div>

            <div className="relationship-count">
              <strong>{relationships.length}</strong>

              <span>
                {relationships.length === 1 ? "connection" : "connections"}
              </span>
            </div>
          </div>

          {relationships.length === 0 ? (
            <div className="empty-relationships">
              <div className="empty-icon">🔗</div>

              <h3>No relationships yet</h3>

              <p>Start by connecting two members of your family tree.</p>
            </div>
          ) : (
            <div className="relationship-cards">
              {relationships.map((relationship) => {
                const memberOneName =
                  relationship.memberOne?.fullName ||
                  getMemberName(relationship.memberOne?.id);

                const memberTwoName =
                  relationship.memberTwo?.fullName ||
                  getMemberName(relationship.memberTwo?.id);

                return (
                  <article key={relationship.id} className="relationship-card">
                    <div className="relationship-member">
                      <div className="relationship-avatar">
                        {memberOneName?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      <div className="relationship-member-info">
                        <span>MEMBER 1</span>

                        <strong>{memberOneName}</strong>
                      </div>
                    </div>

                    <div className="relationship-middle">
                      <span>{relationship.relationshipType}</span>

                      <div>→</div>
                    </div>

                    <div className="relationship-member">
                      <div className="relationship-avatar">
                        {memberTwoName?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      <div className="relationship-member-info">
                        <span>MEMBER 2</span>

                        <strong>{memberTwoName}</strong>
                      </div>
                    </div>

                    {canManageRelationships && (
                      <div className="relationship-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => startEdit(relationship)}
                          disabled={saving}
                        >
                          ✏ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteRelationship(relationship.id)}
                          disabled={saving}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default RelationshipsPage;
