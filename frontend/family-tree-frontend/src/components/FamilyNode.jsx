import React, { useState } from "react";
import axios from "axios";
import { Handle, Position } from "reactflow";

function FamilyNode({ data }) {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);

  const [eventData, setEventData] = useState({
    title: "",

    description: "",

    eventDate: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    fullName: data.label,

    gender: data.gender,

    occupation: data.occupation,

    biography: data.biography,

    dateOfBirth: data.dateOfBirth,
  });
  const handleEventChange = (e) => {
    setEventData({
      ...eventData,

      [e.target.name]: e.target.value,
    });
  };
  const handleEditChange = (e) => {
    setEditData({
      ...editData,

      [e.target.name]: e.target.value,
    });
  };
  const updateMember = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/members/${data.id}`,

        {
          fullName: editData.fullName,

          gender: editData.gender,

          occupation: editData.occupation,

          biography: editData.biography,

          dateOfBirth: editData.dateOfBirth,

          imagePath: data.imagePath,
        },
      );

      alert("Member Updated Successfully");

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  const deleteMember = async () => {
    const confirmDelete = window.confirm("Delete this member?");

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/members/${data.id}`);

      alert("Member Deleted");

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const addLifeEvent = async () => {
    try {
      const payload = {
        title: eventData.title,

        description: eventData.description,

        eventDate: eventData.eventDate,

        familyMember: {
          id: data.id,
        },
      };

      await axios.post(
        "http://localhost:8080/api/events",

        payload,
      );

      alert("Life Event Added");

      const updated = await axios.get("http://localhost:8080/api/events");

      const memberEvents = updated.data.filter(
        (event) => event.familyMember?.id === data.id,
      );

      setEvents(memberEvents);

      setEventData({
        title: "",

        description: "",

        eventDate: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        onClick={async () => {
          setShowModal(true);

          try {
            const response = await axios.get(
              "http://localhost:8080/api/events",
            );

            const memberEvents = response.data.filter(
              (event) => event.familyMember?.id === data.id,
            );

            setEvents(memberEvents);
          } catch (error) {
            console.log(error);
          }
        }}
        style={{
          cursor: "pointer",

          width: "240px",

          borderRadius: "25px",

          overflow: "hidden",

          background: "rgba(255,255,255,0.15)",

          backdropFilter: "blur(15px)",

          border:
            data.gender === "Male" ? "3px solid #42A5F5" : "3px solid #EC407A",

          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",

          transition: "0.3s",
        }}
        className="family-card"
      >
        <Handle type="target" position={Position.Top} />

        <div
          style={{
            position: "relative",
          }}
        >
          <img
            src={`http://localhost:8080/uploads/${data.imagePath}`}
            alt="member"
            style={{
              width: "100%",

              height: "220px",

              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",

              top: "15px",

              right: "15px",

              background: data.gender === "Male" ? "#42A5F5" : "#EC407A",

              color: "white",

              padding: "6px 12px",

              borderRadius: "20px",

              fontSize: "12px",

              fontWeight: "bold",
            }}
          >
            {data.gender}
          </div>
        </div>

        <div
          style={{
            padding: "18px",
          }}
        >
          <h2
            style={{
              marginBottom: "10px",
              color: "#222",
            }}
          >
            {data.label}
          </h2>

          <p
            style={{
              color: "#666",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {data.occupation}
          </p>

          <p
            style={{
              color: "#888",
              fontSize: "14px",
            }}
          >
            🎂 {data.dateOfBirth}
          </p>
        </div>

        <Handle type="source" position={Position.Bottom} />
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "650px",

              background: "white",

              borderRadius: "30px",

              overflow: "hidden",

              position: "relative",

              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",

                top: "20px",

                right: "20px",

                width: "40px",

                height: "40px",

                borderRadius: "50%",

                border: "none",

                background: "red",

                color: "white",

                fontSize: "18px",

                cursor: "pointer",

                zIndex: 10,
              }}
            >
              X
            </button>

            <img
              src={`http://localhost:8080/uploads/${data.imagePath}`}
              alt="member"
              style={{
                width: "100%",

                height: "350px",

                objectFit: "cover",
              }}
            />

            <div
              style={{
                padding: "30px",
              }}
            >
              <h1
                style={{
                  marginBottom: "10px",
                }}
              >
                {data.label}
              </h1>
              <h2
                style={{
                  color: data.gender === "Male" ? "#42A5F5" : "#EC407A",

                  marginBottom: "20px",
                }}
              >
                {data.occupation}
              </h2>
              <div
                style={{
                  display: "grid",

                  gridTemplateColumns: "1fr 1fr",

                  gap: "20px",

                  marginBottom: "25px",
                }}
              >
                <div>
                  <b>Gender</b>

                  <p>{data.gender}</p>
                </div>

                <div>
                  <b>Date of Birth</b>

                  <p>{data.dateOfBirth}</p>
                </div>
              </div>
              <hr />
              <h3
                style={{
                  marginTop: "25px",
                }}
              >
                Biography
              </h3>
              ```jsx id="n4v9zr"
              <hr
                style={{
                  margin: "30px 0",
                }}
              />
              <h2
                style={{
                  marginBottom: "20px",
                }}
              >
                Life Timeline 📜
              </h2>
              <div
                style={{
                  marginBottom: "30px",
                }}
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={eventData.title}
                  onChange={handleEventChange}
                />

                <br />
                <br />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={eventData.description}
                  onChange={handleEventChange}
                />

                <br />
                <br />

                <input
                  type="date"
                  name="eventDate"
                  value={eventData.eventDate}
                  onChange={handleEventChange}
                />

                <br />
                <br />

                <button
                  onClick={addLifeEvent}
                  style={{
                    background: "#4CAF50",

                    color: "white",

                    border: "none",

                    padding: "12px 25px",

                    borderRadius: "10px",

                    cursor: "pointer",
                  }}
                >
                  Add Event
                </button>
              </div>
              <div>
                {events.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      borderLeft: "5px solid #4CAF50",

                      paddingLeft: "20px",

                      marginBottom: "25px",

                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",

                        height: "16px",

                        background: "#4CAF50",

                        borderRadius: "50%",

                        position: "absolute",

                        left: "-10px",

                        top: "8px",
                      }}
                    />

                    <h3>{event.title}</h3>

                    <p
                      style={{
                        color: "#777",
                      }}
                    >
                      {event.eventDate}
                    </p>

                    <p>{event.description}</p>
                  </div>
                ))}
              </div>
              ```
              <p
                style={{
                  lineHeight: "1.8",

                  color: "#444",

                  marginTop: "15px",
                }}
              >
                {data.biography}
                <hr
                  style={{
                    margin: "25px 0",
                  }}
                />
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    background: "#2196F3",

                    color: "white",

                    border: "none",

                    padding: "12px 25px",

                    borderRadius: "10px",

                    marginRight: "15px",

                    cursor: "pointer",
                  }}
                >
                  Edit Member
                </button>
                <button
                  onClick={deleteMember}
                  style={{
                    background: "red",

                    color: "white",

                    border: "none",

                    padding: "12px 25px",

                    borderRadius: "10px",

                    cursor: "pointer",
                  }}
                >
                  Delete Member
                </button>
                {isEditing && (
                  <div
                    style={{
                      marginTop: "30px",
                    }}
                  >
                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleEditChange}
                      placeholder="Full Name"
                    />

                    <br />
                    <br />

                    <input
                      type="text"
                      name="occupation"
                      value={editData.occupation}
                      onChange={handleEditChange}
                      placeholder="Occupation"
                    />

                    <br />
                    <br />

                    <textarea
                      name="biography"
                      value={editData.biography}
                      onChange={handleEditChange}
                      placeholder="Biography"
                    />

                    <br />
                    <br />

                    <button
                      onClick={updateMember}
                      style={{
                        background: "#4CAF50",

                        color: "white",

                        border: "none",

                        padding: "12px 25px",

                        borderRadius: "10px",

                        cursor: "pointer",
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FamilyNode;
