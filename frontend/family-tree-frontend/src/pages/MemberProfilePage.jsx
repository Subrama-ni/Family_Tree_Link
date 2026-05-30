import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import axios from "axios";
import { useNavigate } from "react-router-dom";

function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [relationships, setRelationships] = useState([]);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchMember();
    fetchEvents();
    fetchRelationships();
  }, []);

  const fetchMember = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/members/${id}`,
      );

      setMember(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/events");

      const memberEvents = response.data.filter(
        (event) => event.familyMember?.id === parseInt(id),
      );

      setEvents(memberEvents);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchRelationships = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/relationships",
      );

      setRelationships(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!member) {
    return <h2>Loading...</h2>;
  }
  const memberRelationships = relationships.filter(
    (relation) =>
      relation.memberOne?.id === parseInt(id) ||
      relation.memberTwo?.id === parseInt(id),
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img
          src={`http://localhost:8080/uploads/${member.imagePath}`}
          alt="member"
          className="profile-image"
        />

        <div>
          <h1>{member.fullName}</h1>

          <h3>{member.occupation}</h3>

          <p>{member.gender}</p>

          <p>{member.dateOfBirth}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2>Biography</h2>

        <p>{member.biography}</p>
      </div>

      <div className="profile-section">
        <h2>Life Timeline</h2>

        {events.map((event) => (
          <div key={event.id} className="timeline-item">
            <h3>{event.title}</h3>

            <p>{event.eventDate}</p>

            <p>{event.description}</p>
          </div>
        ))}
        <div className="profile-section">
          <h2>Family Relationships</h2>

          {memberRelationships.map((relation) => (
            <div key={relation.id} className="relationship-card">
              <h3>
                {relation.memberOne.id === parseInt(id)
                  ? relation.relationshipType
                  : "Related To"}
              </h3>

              <p
                style={{
                  cursor: "pointer",
                  color: "#4ade80",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  const targetId =
                    relation.memberOne.id === parseInt(id)
                      ? relation.memberTwo.id
                      : relation.memberOne.id;

                  navigate(`/member/${targetId}`);
                }}
              >
                {relation.memberOne.id === parseInt(id)
                  ? relation.memberTwo.fullName
                  : relation.memberOne.fullName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MemberProfilePage;
