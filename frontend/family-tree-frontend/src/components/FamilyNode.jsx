import React, { useEffect, useState } from "react";

import { createPortal } from "react-dom";

import api from "../services/api";

import { Handle, Position } from "reactflow";

import FamilyStoryPanel from "./FamilyStoryPanel";

function FamilyNode({ data }) {
  const [showModal, setShowModal] = useState(false);

  const [showFamilyStory, setShowFamilyStory] = useState(false);

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

  // ============================================================
  // RELATIONSHIP STATE
  // ============================================================

  const [showRelationshipModal, setShowRelationshipModal] = useState(false);

  const [familyMembers, setFamilyMembers] = useState([]);

  const [relationshipData, setRelationshipData] = useState({
    memberTwoId: "",
    relationshipType: "",
  });

  // ============================================================
  // ONLY ONE MEMBER DIALOG CAN BE OPEN AT A TIME
  // ============================================================

  useEffect(() => {
    const handleAnotherMemberOpened = (event) => {
      const openedMemberId = event.detail.memberId;

      if (openedMemberId !== data.id) {
        setShowModal(false);

        setShowRelationshipModal(false);

        setShowFamilyStory(false);
      }
    };

    window.addEventListener(
      "family-member-dialog-opened",
      handleAnotherMemberOpened,
    );

    return () => {
      window.removeEventListener(
        "family-member-dialog-opened",
        handleAnotherMemberOpened,
      );
    };
  }, [data.id]);

  // ============================================================
  // EVENT CHANGE
  // ============================================================

  const handleEventChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================================
  // EDIT CHANGE
  // ============================================================

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================================
  // UPDATE MEMBER
  // ============================================================

  const updateMember = async () => {
    try {
      await api.put(`http://localhost:8080/api/members/${data.id}`, {
        fullName: editData.fullName,

        gender: editData.gender,

        occupation: editData.occupation,

        biography: editData.biography,

        dateOfBirth: editData.dateOfBirth,

        imagePath: data.imagePath,
      });

      alert("Member Updated Successfully");

      window.location.reload();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Unable to update member");
    }
  };

  // ============================================================
  // DELETE MEMBER
  // ============================================================

  const deleteMember = async () => {
    const confirmDelete = window.confirm("Delete this member?");

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`http://localhost:8080/api/members/${data.id}`);

      alert("Member Deleted");

      window.location.reload();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Unable to delete member");
    }
  };

  // ============================================================
  // ADD LIFE EVENT
  // ============================================================

  const addLifeEvent = async () => {
    if (!eventData.title.trim()) {
      alert("Please enter an event title");

      return;
    }

    try {
      const payload = {
        title: eventData.title,

        description: eventData.description,

        eventDate: eventData.eventDate,

        familyMember: {
          id: data.id,
        },
      };

      await api.post("http://localhost:8080/api/events", payload);

      alert("Life Event Added");

      const updated = await api.get("http://localhost:8080/api/events");

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

      alert(error.response?.data?.message || "Unable to add life event");
    }
  };

  // ============================================================
  // OPEN RELATIONSHIP MODAL
  // ============================================================

  const openRelationshipModal = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    try {
      window.dispatchEvent(
        new CustomEvent("family-member-dialog-opened", {
          detail: {
            memberId: data.id,
          },
        }),
      );

      setShowModal(false);

      setShowFamilyStory(false);

      const response = await api.get("http://localhost:8080/api/members");

      setFamilyMembers(response.data);

      setRelationshipData({
        memberTwoId: "",
        relationshipType: "",
      });

      setShowRelationshipModal(true);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Unable to load family members");
    }
  };

  // ============================================================
  // OPEN FAMILY STORY
  // ============================================================

  const openFamilyStory = (event) => {
    event.preventDefault();

    event.stopPropagation();

    /*
     * Tell every other member node to close.
     */
    window.dispatchEvent(
      new CustomEvent("family-member-dialog-opened", {
        detail: {
          memberId: data.id,
        },
      }),
    );

    /*
     * Close the normal member dialog.
     */
    setShowModal(false);

    /*
     * Close relationship dialog.
     */
    setShowRelationshipModal(false);

    /*
     * Open cinematic story.
     */
    setShowFamilyStory(true);
  };

  // ============================================================
  // ADD RELATIONSHIP
  // ============================================================

  /*
   * IMPORTANT:
   *
   * The selected member becomes memberOne.
   * The current member becomes memberTwo.
   */

  const addRelationship = async () => {
    if (!relationshipData.memberTwoId) {
      alert("Please select a family member");

      return;
    }

    if (!relationshipData.relationshipType) {
      alert("Please select a relationship");

      return;
    }

    const selectedMemberId = parseInt(relationshipData.memberTwoId);

    if (selectedMemberId === data.id) {
      alert("A member cannot have a relationship with themselves");

      return;
    }

    try {
      const payload = {
        memberOne: {
          id: selectedMemberId,
        },

        memberTwo: {
          id: data.id,
        },

        relationshipType: relationshipData.relationshipType,
      };

      await api.post("http://localhost:8080/api/relationships", payload);

      alert("Relationship Added Successfully");

      setShowRelationshipModal(false);

      setRelationshipData({
        memberTwoId: "",
        relationshipType: "",
      });

      window.location.reload();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Unable to add relationship");
    }
  };

  // ============================================================
  // OPEN MEMBER DETAILS
  // ============================================================

  const openMemberDetails = async (event) => {
    event.stopPropagation();

    /*
     * Close all other member dialogs.
     */
    window.dispatchEvent(
      new CustomEvent("family-member-dialog-opened", {
        detail: {
          memberId: data.id,
        },
      }),
    );

    /*
     * Normal member dialog.
     */
    setShowModal(true);

    /*
     * Make sure other dialogs are closed.
     */
    setShowRelationshipModal(false);

    setShowFamilyStory(false);

    try {
      const response = await api.get("http://localhost:8080/api/events");

      const memberEvents = response.data.filter(
        (event) => event.familyMember?.id === data.id,
      );

      setEvents(memberEvents);
    } catch (error) {
      console.log(error);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ======================================================
          FAMILY MEMBER NODE
          ====================================================== */}

      <div
        onClick={openMemberDetails}
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
        {/* ==================================================
            TARGET HANDLE
            ================================================== */}

        <Handle type="target" position={Position.Top} />

        {/* ==================================================
            IMAGE
            ================================================== */}

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

          {/* ==================================================
              GENDER BADGE
              ================================================== */}

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

        {/* ==================================================
            BASIC INFORMATION
            ================================================== */}

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

        {/* ==================================================
            SOURCE HANDLE
            ================================================== */}

        <Handle type="source" position={Position.Bottom} />
      </div>

      {/* ======================================================
          MEMBER DETAILS MODAL
          ====================================================== */}

      {showModal && (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
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

            overflowY: "auto",

            padding: "30px",

            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            style={{
              width: "650px",

              maxWidth: "95%",

              background: "white",

              borderRadius: "30px",

              overflow: "hidden",

              position: "relative",

              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",

              margin: "30px auto",
            }}
          >
            {/* ==================================================
                CLOSE
                ================================================== */}

            <button
              onClick={(event) => {
                event.stopPropagation();

                setShowModal(false);
              }}
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

            {/* ==================================================
                MEMBER IMAGE
                ================================================== */}

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
              {/* ==================================================
                  NAME
                  ================================================== */}

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

              {/* ==================================================
                  BASIC DETAILS
                  ================================================== */}

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

              {/* ==================================================
                  BIOGRAPHY
                  ================================================== */}

              <h3
                style={{
                  marginTop: "25px",
                }}
              >
                Biography
              </h3>

              <p
                style={{
                  lineHeight: "1.8",

                  color: "#444",

                  marginTop: "15px",
                }}
              >
                {data.biography || "No biography available."}
              </p>

              <hr
                style={{
                  margin: "30px 0",
                }}
              />

              {/* ==================================================
                  LIFE TIMELINE
                  ================================================== */}

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
                  style={{
                    width: "100%",

                    padding: "10px",

                    boxSizing: "border-box",
                  }}
                />

                <br />
                <br />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={eventData.description}
                  onChange={handleEventChange}
                  style={{
                    width: "100%",

                    padding: "10px",

                    boxSizing: "border-box",
                  }}
                />

                <br />
                <br />

                <input
                  type="date"
                  name="eventDate"
                  value={eventData.eventDate}
                  onChange={handleEventChange}
                  style={{
                    padding: "10px",
                  }}
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

              {/* ==================================================
                  EXISTING EVENTS
                  ================================================== */}

              <div>
                {events.length === 0 ? (
                  <p
                    style={{
                      color: "#888",
                    }}
                  >
                    No life events added yet.
                  </p>
                ) : (
                  events.map((event) => (
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
                  ))
                )}
              </div>

              <hr
                style={{
                  margin: "30px 0",
                }}
              />

              {/* ==================================================
                  MEMBER ACTIONS
                  ================================================== */}

              <div
                style={{
                  display: "flex",

                  flexWrap: "wrap",

                  gap: "12px",
                }}
              >
                {/* EDIT */}

                <button
                  onClick={(event) => {
                    event.stopPropagation();

                    setIsEditing(!isEditing);
                  }}
                  style={{
                    background: "#2196F3",

                    color: "white",

                    border: "none",

                    padding: "12px 20px",

                    borderRadius: "10px",

                    cursor: "pointer",
                  }}
                >
                  Edit Member
                </button>

                {/* DELETE */}

                <button
                  onClick={(event) => {
                    event.stopPropagation();

                    deleteMember();
                  }}
                  style={{
                    background: "red",

                    color: "white",

                    border: "none",

                    padding: "12px 20px",

                    borderRadius: "10px",

                    cursor: "pointer",
                  }}
                >
                  Delete Member
                </button>

                {/* RELATIONSHIP */}

                <button
                  onClick={openRelationshipModal}
                  style={{
                    background: "#8B5CF6",

                    color: "white",

                    border: "none",

                    padding: "12px 20px",

                    borderRadius: "10px",

                    cursor: "pointer",
                  }}
                >
                  Add Relationship
                </button>

                {/* ==================================================
                    FAMILY STORY
                    ================================================== */}

                <button
                  onClick={openFamilyStory}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  style={{
                    background: "linear-gradient(135deg, #a08d55, #789456)",

                    color: "white",

                    border: "none",

                    padding: "12px 20px",

                    borderRadius: "10px",

                    cursor: "pointer",

                    fontWeight: "700",

                    boxShadow: "0 8px 20px rgba(120,148,86,0.25)",
                  }}
                >
                  ✦ Family Story
                </button>
              </div>

              {/* ==================================================
                  EDIT MEMBER
                  ================================================== */}

              {isEditing && (
                <div
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    marginTop: "30px",

                    padding: "20px",

                    borderRadius: "15px",

                    background: "#f5f5f5",
                  }}
                >
                  <h3>Edit Member</h3>

                  <input
                    type="text"
                    name="fullName"
                    value={editData.fullName}
                    onChange={handleEditChange}
                    placeholder="Full Name"
                    style={{
                      width: "100%",

                      padding: "10px",

                      marginTop: "15px",

                      boxSizing: "border-box",
                    }}
                  />

                  <br />
                  <br />

                  <input
                    type="text"
                    name="occupation"
                    value={editData.occupation}
                    onChange={handleEditChange}
                    placeholder="Occupation"
                    style={{
                      width: "100%",

                      padding: "10px",

                      boxSizing: "border-box",
                    }}
                  />

                  <br />
                  <br />

                  <textarea
                    name="biography"
                    value={editData.biography}
                    onChange={handleEditChange}
                    placeholder="Biography"
                    style={{
                      width: "100%",

                      padding: "10px",

                      boxSizing: "border-box",
                    }}
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
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD RELATIONSHIP MODAL
          ======================================================== */}

      {showRelationshipModal && (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
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

            zIndex: 20000,

            padding: "20px",

            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            style={{
              width: "450px",

              maxWidth: "95%",

              background: "white",

              borderRadius: "20px",

              padding: "30px",

              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",

              position: "relative",
            }}
          >
            {/* CLOSE */}

            <button
              onClick={(event) => {
                event.stopPropagation();

                setShowRelationshipModal(false);
              }}
              style={{
                position: "absolute",

                top: "15px",

                right: "15px",

                width: "35px",

                height: "35px",

                borderRadius: "50%",

                border: "none",

                background: "#ef4444",

                color: "white",

                cursor: "pointer",

                fontWeight: "bold",
              }}
            >
              X
            </button>

            <h2
              style={{
                marginBottom: "10px",
              }}
            >
              Add Relationship
            </h2>

            <p
              style={{
                color: "#666",

                marginBottom: "25px",
              }}
            >
              Add a relationship for:
              <strong> {data.label}</strong>
            </p>

            <hr />

            {/* ==================================================
                FAMILY MEMBER
                ================================================== */}

            <label
              style={{
                display: "block",

                marginTop: "25px",

                marginBottom: "8px",

                fontWeight: "bold",
              }}
            >
              Related Family Member
            </label>

            <select
              value={relationshipData.memberTwoId}
              onChange={(event) => {
                event.stopPropagation();

                setRelationshipData({
                  ...relationshipData,

                  memberTwoId: event.target.value,
                });
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                width: "100%",

                padding: "12px",

                borderRadius: "8px",

                border: "1px solid #ccc",

                boxSizing: "border-box",
              }}
            >
              <option value="">Select Family Member</option>

              {familyMembers
                .filter((member) => member.id !== data.id)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
            </select>

            {/* ==================================================
                RELATIONSHIP TYPE
                ================================================== */}

            <label
              style={{
                display: "block",

                marginTop: "20px",

                marginBottom: "8px",

                fontWeight: "bold",
              }}
            >
              Relationship Type
            </label>

            <select
              value={relationshipData.relationshipType}
              onChange={(event) => {
                event.stopPropagation();

                setRelationshipData({
                  ...relationshipData,

                  relationshipType: event.target.value,
                });
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                width: "100%",

                padding: "12px",

                borderRadius: "8px",

                border: "1px solid #ccc",

                boxSizing: "border-box",
              }}
            >
              <option value="">Select Relationship</option>

              <option value="Father">Father</option>

              <option value="Mother">Mother</option>

              <option value="Son">Son</option>

              <option value="Daughter">Daughter</option>

              <option value="Husband">Husband</option>

              <option value="Wife">Wife</option>

              <option value="Brother">Brother</option>

              <option value="Sister">Sister</option>

              <option value="Grandfather">Grandfather</option>

              <option value="Grandmother">Grandmother</option>

              <option value="Grandson">Grandson</option>

              <option value="Granddaughter">Granddaughter</option>
            </select>

            {/* ==================================================
                PREVIEW
                ================================================== */}

            {relationshipData.memberTwoId &&
              relationshipData.relationshipType && (
                <div
                  style={{
                    marginTop: "20px",

                    padding: "15px",

                    background: "#f3f4f6",

                    borderRadius: "10px",

                    textAlign: "center",
                  }}
                >
                  <strong>
                    {
                      familyMembers.find(
                        (member) =>
                          member.id === parseInt(relationshipData.memberTwoId),
                      )?.fullName
                    }
                  </strong>

                  <div
                    style={{
                      margin: "8px 0",

                      color: "#8B5CF6",

                      fontWeight: "bold",
                    }}
                  >
                    ↓ {relationshipData.relationshipType} ↓
                  </div>

                  <strong>{data.label}</strong>
                </div>
              )}

            {/* ==================================================
                ACTION BUTTONS
                ================================================== */}

            <div
              style={{
                display: "flex",

                gap: "15px",

                marginTop: "25px",
              }}
            >
              <button
                onClick={(event) => {
                  event.stopPropagation();

                  addRelationship();
                }}
                style={{
                  flex: 1,

                  background: "#4CAF50",

                  color: "white",

                  border: "none",

                  padding: "13px",

                  borderRadius: "10px",

                  cursor: "pointer",

                  fontWeight: "bold",
                }}
              >
                Save Relationship
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setShowRelationshipModal(false);
                }}
                style={{
                  flex: 1,

                  background: "#777",

                  color: "white",

                  border: "none",

                  padding: "13px",

                  borderRadius: "10px",

                  cursor: "pointer",

                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FAMILY STORY
          
          IMPORTANT:
          Render outside React Flow using a PORTAL.
          ======================================================== */}

      {showFamilyStory &&
        createPortal(
          <FamilyStoryPanel
            member={data}
            onClose={() => {
              setShowFamilyStory(false);
            }}
          />,
          document.body,
        )}
    </>
  );
}

export default FamilyNode;
