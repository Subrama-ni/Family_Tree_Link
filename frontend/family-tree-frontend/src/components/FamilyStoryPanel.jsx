import React, { useEffect, useState } from "react";

import api from "../services/api";

function FamilyStoryPanel({ member, onClose }) {
  const [relationships, setRelationships] = useState([]);

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD RELATIONSHIPS
  // ============================================================

  useEffect(() => {
    if (!member?.id) {
      return;
    }

    const loadRelationships = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/relationships");

        const memberRelationships = response.data.filter(
          (relationship) =>
            Number(relationship.memberOne?.id) === Number(member.id) ||
            Number(relationship.memberTwo?.id) === Number(member.id),
        );

        setRelationships(memberRelationships);
      } catch (error) {
        console.log("Unable to load relationships:", error);

        setRelationships([]);
      } finally {
        setLoading(false);
      }
    };

    loadRelationships();
  }, [member]);

  // ============================================================
  // CLOSE WITH ESCAPE
  // ============================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // ============================================================
  // RELATED MEMBER
  // ============================================================

  const getRelatedMember = (relationship) => {
    if (Number(relationship.memberOne?.id) === Number(member.id)) {
      return relationship.memberTwo;
    }

    return relationship.memberOne;
  };

  // ============================================================
  // DISPLAY RELATIONSHIP NAME
  // ============================================================

  const getDisplayRelationship = (relationship) => {
    /*
     * The backend stores the relationship from
     * memberOne → memberTwo.
     *
     * For the selected member we want the
     * relationship as it applies to them.
     */

    const type = relationship.relationshipType;

    const memberOneIsCurrent =
      Number(relationship.memberOne?.id) === Number(member.id);

    if (memberOneIsCurrent) {
      const reverseMap = {
        Father: "Son / Daughter",

        Mother: "Son / Daughter",

        Son: "Parent",

        Daughter: "Parent",

        Husband: "Wife / Spouse",

        Wife: "Husband / Spouse",

        Brother: "Brother",

        Sister: "Sister",

        Grandfather: "Grandson / Granddaughter",

        Grandmother: "Grandson / Granddaughter",

        Grandson: "Grandfather / Grandmother",

        Granddaughter: "Grandfather / Grandmother",

        Uncle: "Nephew / Niece",

        Aunt: "Nephew / Niece",

        Nephew: "Uncle / Aunt",

        Niece: "Uncle / Aunt",

        Cousin: "Cousin",
      };

      return reverseMap[type] || type;
    }

    return type;
  };

  // ============================================================
  // ICON
  // ============================================================

  const getRelationshipIcon = (type) => {
    switch (type) {
      case "Father":
        return "👨";

      case "Mother":
        return "👩";

      case "Husband":
      case "Wife":
      case "Spouse":
        return "💍";

      case "Son":
      case "Daughter":
        return "👶";

      case "Brother":
      case "Sister":
        return "🧑‍🤝‍🧑";

      case "Grandfather":
      case "Grandmother":
        return "👴";

      case "Grandson":
      case "Granddaughter":
        return "👶";

      case "Uncle":
      case "Aunt":
        return "👨‍👩‍👧";

      case "Nephew":
      case "Niece":
        return "🧒";

      case "Cousin":
        return "🧬";

      default:
        return "✨";
    }
  };

  // ============================================================
  // RELATIONSHIP CLASS
  // ============================================================

  const getRelationshipClass = (type) => {
    if (type === "Husband" || type === "Wife" || type === "Spouse") {
      return "story-relation-spouse";
    }

    if (
      type === "Father" ||
      type === "Mother" ||
      type === "Parent" ||
      type === "Son" ||
      type === "Daughter"
    ) {
      return "story-relation-family";
    }

    if (type === "Brother" || type === "Sister") {
      return "story-relation-sibling";
    }

    if (
      type === "Grandfather" ||
      type === "Grandmother" ||
      type === "Grandson" ||
      type === "Granddaughter"
    ) {
      return "story-relation-grand";
    }

    if (
      type === "Uncle" ||
      type === "Aunt" ||
      type === "Nephew" ||
      type === "Niece"
    ) {
      return "story-relation-extended";
    }

    if (type === "Cousin") {
      return "story-relation-cousin";
    }

    return "story-relation-other";
  };

  // ============================================================
  // MEMBER INITIALS
  // ============================================================

  const getInitials = (name) => {
    if (!name) {
      return "FM";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // ============================================================
  // IMAGE URL
  // ============================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    return `http://localhost:8080/uploads/${imagePath}`;
  };

  if (!member) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="family-story-overlay"
      onClick={(event) => {
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      {/* ======================================================
          BACKDROP
          ====================================================== */}

      <div
        className="family-story-backdrop"
        onClick={(event) => {
          event.stopPropagation();

          onClose();
        }}
      />

      {/* ======================================================
          PANEL
          ====================================================== */}

      <div
        className="family-story-panel"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* ====================================================
            DECORATIVE GLOW
            ==================================================== */}

        <div className="story-panel-glow" />

        {/* ====================================================
            CLOSE
            ==================================================== */}

        <button
          className="family-story-close"
          onClick={(event) => {
            event.preventDefault();

            event.stopPropagation();

            onClose();
          }}
        >
          ×
        </button>

        {/* ====================================================
            HERO
            ==================================================== */}

        <div className="family-story-hero">
          <div className="story-photo-wrapper">
            {getImageUrl(member.imagePath) ? (
              <img
                src={getImageUrl(member.imagePath)}
                alt={member.fullName}
                className="story-member-photo"
              />
            ) : (
              <div className="story-photo-placeholder">
                {getInitials(member.fullName)}
              </div>
            )}

            <div className="story-photo-ring" />
          </div>

          <div className="story-hero-info">
            <span className="story-eyebrow">FAMILY STORY</span>

            <h1>{member.fullName}</h1>

            <p className="story-occupation">
              {member.occupation || "Family Member"}
            </p>

            <div className="story-basic-pills">
              <span>
                {member.gender === "Male"
                  ? "♂"
                  : member.gender === "Female"
                    ? "♀"
                    : "•"}{" "}
                {member.gender || "Member"}
              </span>

              {member.dateOfBirth && <span>🎂 {member.dateOfBirth}</span>}
            </div>
          </div>
        </div>

        {/* ====================================================
            INTRODUCTION
            ==================================================== */}

        <div className="family-story-intro">
          <span className="story-quote-mark">“</span>

          <p>
            {member.biography ||
              `${member.fullName} is a cherished member of this family story.`}
          </p>
        </div>

        {/* ====================================================
            CONNECTIONS
            ==================================================== */}

        <div className="story-section">
          <div className="story-section-heading">
            <div>
              <span>FAMILY CONNECTIONS</span>

              <h2>Family Around Them</h2>
            </div>

            <div className="story-connection-count">{relationships.length}</div>
          </div>

          {loading ? (
            <div className="story-loading">
              <div className="story-spinner" />

              <span>Discovering family connections...</span>
            </div>
          ) : relationships.length === 0 ? (
            <div className="story-empty">
              <span>🌱</span>

              <p>No relationships have been added yet.</p>
            </div>
          ) : (
            <div className="story-relationships">
              {relationships.map((relationship, index) => {
                const relatedMember = getRelatedMember(relationship);

                if (!relatedMember) {
                  return null;
                }

                const relationshipType = relationship.relationshipType;

                return (
                  <div
                    key={relationship.id}
                    className={`story-relationship-card ${getRelationshipClass(
                      relationshipType,
                    )}`}
                    style={{
                      animationDelay: `${index * 0.08}s`,
                    }}
                  >
                    {/* ICON */}

                    <div className="story-relation-icon">
                      {getRelationshipIcon(relationshipType)}
                    </div>

                    {/* PERSON */}

                    <div className="story-relation-person">
                      <span>{getDisplayRelationship(relationship)}</span>

                      <strong>{relatedMember.fullName}</strong>

                      {relatedMember.occupation && (
                        <small>{relatedMember.occupation}</small>
                      )}
                    </div>

                    {/* ARROW */}

                    <div className="story-relation-arrow">→</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ====================================================
            FAMILY MEMORY
            ==================================================== */}

        <div className="story-memory-card">
          <div className="story-memory-icon">✦</div>

          <div>
            <span>A PIECE OF THE FAMILY</span>

            <p>
              Every person is a chapter. Every relationship is a thread.
              Together, they create a story that continues through generations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FamilyStoryPanel;
