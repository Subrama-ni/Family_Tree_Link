import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function MembersPage() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    biography: "",
    occupation: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    biography: "",
    occupation: "",
    imagePath: "",
  });

  const API_URL = "http://localhost:8080/api/members";

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(API_URL);

      setMembers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedImagePath = "";

      if (selectedFile) {
        const imageData = new FormData();

        imageData.append("file", selectedFile);

        const uploadResponse = await axios.post(
          "http://localhost:8080/api/members/upload",
          imageData,
        );

        uploadedImagePath = uploadResponse.data;
      }

      await axios.post(API_URL, {
        ...formData,

        imagePath: uploadedImagePath,
      });

      alert("Member Added Successfully");

      setFormData({
        fullName: "",
        gender: "",
        dateOfBirth: "",
        biography: "",
        occupation: "",
        imagePath: "",
      });

      fetchMembers();
    } catch (error) {
      console.log(error);
    }
  };
  const startEdit = (member) => {
    setEditingMember(member);

    setEditData({
      fullName: member.fullName,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
      biography: member.biography,
      occupation: member.occupation,
    });
  };
  const updateMember = async () => {
    try {
      let uploadedImagePath = editingMember.imagePath;

      if (editFile) {
        const imageData = new FormData();

        imageData.append("file", editFile);

        const uploadResponse = await axios.post(
          "http://localhost:8080/api/members/upload",
          imageData,
        );

        uploadedImagePath = uploadResponse.data;
      }

      await axios.put(`${API_URL}/${editingMember.id}`, {
        ...editData,

        imagePath: uploadedImagePath,
      });

      alert("Member Updated Successfully");

      setEditingMember(null);

      setEditFile(null);

      fetchMembers();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Delete this member?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      fetchMembers();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === "" || member.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  return (
    <div className="members-page">
      <h1>Manage Family Members</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="">All Genders</option>

          <option value="Male">Male</option>

          <option value="Female">Female</option>
        </select>
      </div>

      <div className="member-layout">
        <div className="member-form">
          <h2>Add New Member</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />

            <input
              type="text"
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleChange}
            />

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <textarea
              name="biography"
              placeholder="Biography"
              value={formData.biography}
              onChange={handleChange}
            />

            <input
              type="text"
              name="occupation"
              placeholder="Occupation"
              value={formData.occupation}
              onChange={handleChange}
            />

            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />

            <button type="submit">Add Member</button>
          </form>
        </div>

        <div className="member-grid">
          {filteredMembers.map((member) => (
            <div key={member.id} className="member-card">
              <img
                src={`http://localhost:8080/uploads/${member.imagePath}`}
                alt="member"
              />

              <h3>{member.fullName}</h3>

              <p>{member.occupation}</p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button onClick={() => navigate(`/member/${member.id}`)}>
                  View Profile
                </button>
                <button onClick={() => startEdit(member)}>Edit</button>

                <button onClick={() => deleteMember(member.id)}>Delete</button>
              </div>
            </div>
          ))}
          {editingMember && (
            <div className="edit-modal">
              <div className="edit-content">
                <h2>Edit Member</h2>
                <img
                  src={`http://localhost:8080/uploads/${editingMember.imagePath}`}
                  alt="member"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "15px",
                    marginBottom: "15px",
                  }}
                />
                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files[0])}
                />

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

                <input
                  type="text"
                  value={editData.gender}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      gender: e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  value={editData.dateOfBirth}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      dateOfBirth: e.target.value,
                    })
                  }
                />

                <textarea
                  value={editData.biography}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      biography: e.target.value,
                    })
                  }
                />

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

                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "20px",
                  }}
                >
                  <button onClick={updateMember}>Save</button>

                  <button onClick={() => setEditingMember(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MembersPage;
