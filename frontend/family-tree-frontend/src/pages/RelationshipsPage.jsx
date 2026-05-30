import { useEffect, useState } from "react";
import axios from "axios";

function RelationshipsPage() {
  const [members, setMembers] = useState([]);

  const [relationships, setRelationships] = useState([]);
  const [customRelationship, setCustomRelationship] = useState("");

  const [editingRelationship, setEditingRelationship] = useState(null);
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

  useEffect(() => {
    fetchMembers();

    fetchRelationships();
  }, []);

  const fetchMembers = async () => {
    const response = await axios.get("http://localhost:8080/api/members");

    setMembers(response.data);
  };

  const fetchRelationships = async () => {
    const response = await axios.get("http://localhost:8080/api/relationships");

    setRelationships(response.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const createRelationship = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/relationships",

        {
          relationshipType:
            formData.relationshipType === "Other"
              ? customRelationship
              : formData.relationshipType,

          memberOne: {
            id: formData.memberOneId,
          },

          memberTwo: {
            id: formData.memberTwoId,
          },
        },
      );

      alert("Relationship Created");

      fetchRelationships();
    } catch (error) {
      console.log(error);
    }
  };

  const startEdit = (relationship) => {
    setEditingRelationship(relationship);

    setFormData({
      memberOneId: relationship.memberOne.id,

      relationshipType:
        formData.relationshipType === "Other"
          ? customRelationship
          : formData.relationshipType,

      memberTwoId: relationship.memberTwo.id,
    });
  };

  const updateRelationship = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/relationships/${editingRelationship.id}`,

        {
          relationshipType: formData.relationshipType,

          memberOne: {
            id: formData.memberOneId,
          },

          memberTwo: {
            id: formData.memberTwoId,
          },
        },
      );

      alert("Relationship Updated");

      setEditingRelationship(null);

      fetchRelationships();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRelationship = async (id) => {
    if (!window.confirm("Delete this relationship?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/relationships/${id}`);

      fetchRelationships();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relationships-page">
      <h1>Relationship Management</h1>

      <div className="relationship-form">
        <select
          name="memberOneId"
          value={formData.memberOneId}
          onChange={handleChange}
        >
          <option value="">Select Member 1</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>

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
        {formData.relationshipType === "Other" && (
          <input
            type="text"
            placeholder="Enter Custom Relationship"
            value={customRelationship}
            onChange={(e) => setCustomRelationship(e.target.value)}
          />
        )}

        <select
          name="memberTwoId"
          value={formData.memberTwoId}
          onChange={handleChange}
        >
          <option value="">Select Member 2</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>

        {editingRelationship ? (
          <button onClick={updateRelationship}>Update Relationship</button>
        ) : (
          <button onClick={createRelationship}>Create Relationship</button>
        )}
      </div>

      <div className="relationship-list">
        {relationships.map((relationship) => (
          <div key={relationship.id} className="relationship-card">
            <h3>
              {relationship.memberOne.fullName}

              {" → "}

              {relationship.relationshipType}

              {" → "}

              {relationship.memberTwo.fullName}
            </h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button onClick={() => startEdit(relationship)}>Edit</button>

              <button onClick={() => deleteRelationship(relationship.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelationshipsPage;
