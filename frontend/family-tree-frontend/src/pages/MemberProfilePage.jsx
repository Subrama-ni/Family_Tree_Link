import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";

function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [events, setEvents] = useState([]);

  const memberId = parseInt(id);

  useEffect(() => {
    fetchMember();
    fetchEvents();
    fetchRelationships();
  }, [id]);

  /*
   * ============================================================
   * FETCH MEMBER
   * ============================================================
   */

  const fetchMember = async () => {
    try {
      const response = await api.get(`/api/members/${id}`);

      setMember(response.data);
    } catch (error) {
      console.error("Unable to load member:", error);
    }
  };

  /*
   * ============================================================
   * FETCH LIFE EVENTS
   * ============================================================
   */

  const fetchEvents = async () => {
    try {
      const response = await api.get("/api/events");

      const memberEvents = response.data.filter(
        (event) => event.familyMember?.id === memberId,
      );

      setEvents(memberEvents);
    } catch (error) {
      console.error("Unable to load events:", error);
    }
  };

  /*
   * ============================================================
   * FETCH RELATIONSHIPS
   * ============================================================
   */

  const fetchRelationships = async () => {
    try {
      const response = await api.get("/api/relationships");

      setRelationships(response.data);
    } catch (error) {
      console.error("Unable to load relationships:", error);
    }
  };

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (!member) {
    return <div className="profile-loading">Loading member profile...</div>;
  }

  /*
   * ============================================================
   * FILTER RELATIONSHIPS FOR THIS MEMBER
   * ============================================================
   */

  const memberRelationships = relationships.filter(
    (relation) =>
      relation.memberOne?.id === memberId ||
      relation.memberTwo?.id === memberId,
  );

  return (
    <div className="member-profile-page">
      {/* =====================================================
          PROFILE HEADER
          ===================================================== */}

      <div className="profile-header">
        <img
          src={
            member.imagePath
              ? `http://localhost:8080/uploads/${member.imagePath}`
              : "/default-profile.png"
          }
          alt={member.fullName}
          className="profile-image"
        />

        <div className="profile-main-info">
          <h1>{member.fullName}</h1>

          <h3>{member.occupation || "Occupation not provided"}</h3>

          <p>
            <strong>Gender:</strong> {member.gender || "Not provided"}
          </p>

          <p>
            <strong>Date of Birth:</strong>{" "}
            {member.dateOfBirth || "Not provided"}
          </p>
        </div>
      </div>

      {/* =====================================================
          BIOGRAPHY
          ===================================================== */}

      <div className="profile-section">
        <h2>Biography</h2>

        <p>{member.biography || "No biography has been added yet."}</p>
      </div>

      {/* =====================================================
          LIFE TIMELINE
          ===================================================== */}

      <div className="profile-section">
        <h2>Life Timeline</h2>

        {events.length === 0 ? (
          <p>No life events have been recorded yet.</p>
        ) : (
          <div className="timeline-list">
            {events.map((event) => (
              <div key={event.id} className="timeline-item">
                <h3>{event.title}</h3>

                <p>
                  <strong>{event.eventDate}</strong>
                </p>

                <p>{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          FAMILY RELATIONSHIPS
          ===================================================== */}

      <div className="profile-section">
        <h2>Family Relationships</h2>

        {memberRelationships.length === 0 ? (
          <p>No relationships have been recorded yet.</p>
        ) : (
          <div className="relationship-list">
            {memberRelationships.map((relation) => {
              const isMemberOne = relation.memberOne?.id === memberId;

              const relatedMember = isMemberOne
                ? relation.memberTwo
                : relation.memberOne;

              if (!relatedMember) {
                return null;
              }

              return (
                <div key={relation.id} className="relationship-card">
                  <h3>{relation.relationshipType}</h3>

                  <p
                    style={{
                      cursor: "pointer",
                      color: "#4ade80",
                      fontWeight: "bold",
                    }}
                    onClick={() => navigate(`/member/${relatedMember.id}`)}
                  >
                    {relatedMember.fullName}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          BACK BUTTON
          ===================================================== */}

      <button onClick={() => navigate("/members")}>← Back to Members</button>
    </div>
  );
}

export default MemberProfilePage;
