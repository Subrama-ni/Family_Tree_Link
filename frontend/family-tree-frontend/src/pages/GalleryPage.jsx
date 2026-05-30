import { useEffect, useState } from "react";
import axios from "axios";

function GalleryPage() {
  const [members, setMembers] = useState([]);

  const [photos, setPhotos] = useState([]);

  const [formData, setFormData] = useState({
    memberId: "",
    category: "",
    caption: "",
    imagePath: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const [preview, setPreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [memberFilter, setMemberFilter] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchMembers();

    fetchPhotos();
  }, []);

  const fetchMembers = async () => {
    const response = await axios.get("http://localhost:8080/api/members");

    setMembers(response.data);
  };

  const fetchPhotos = async () => {
    const response = await axios.get("http://localhost:8080/api/photos");

    setPhotos(response.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const addPhoto = async () => {
    try {
      const uploadData = new FormData();

      uploadData.append(
        "file",

        selectedFile,
      );

      const uploadResponse = await axios.post(
        "http://localhost:8080/api/photos/upload",

        uploadData,
      );

      await axios.post(
        "http://localhost:8080/api/photos",

        {
          imagePath: uploadResponse.data,

          caption: formData.caption,

          category: formData.category,

          familyMember: {
            id: formData.memberId,
          },
        },
      );

      fetchPhotos();

      setPreview("");

      setSelectedFile(null);

      setFormData({
        memberId: "",
        category: "",
        caption: "",
        imagePath: "",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const deletePhoto = async (id) => {
    if (!window.confirm("Delete Photo?")) return;

    await axios.delete(`http://localhost:8080/api/photos/${id}`);

    fetchPhotos();
  };
  const editPhoto = (photo) => {
    setEditingId(photo.id);

    setFormData({
      memberId: photo.familyMember?.id,

      category: photo.category,

      caption: photo.caption,

      imagePath: photo.imagePath,
    });

    setPreview(`http://localhost:8080/uploads/${photo.imagePath}`);
  };
  const updatePhoto = async () => {
    try {
      let imagePath = formData.imagePath;

      if (selectedFile) {
        const uploadData = new FormData();

        uploadData.append("file", selectedFile);

        const uploadResponse = await axios.post(
          "http://localhost:8080/api/photos/upload",
          uploadData,
        );

        imagePath = uploadResponse.data;
      }

      await axios.put(
        `http://localhost:8080/api/photos/${editingId}`,

        {
          imagePath,

          caption: formData.caption,

          category: formData.category,

          familyMember: {
            id: formData.memberId,
          },
        },
      );

      fetchPhotos();

      setEditingId(null);

      setPreview("");

      setSelectedFile(null);

      setFormData({
        memberId: "",
        category: "",
        caption: "",
        imagePath: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="gallery-page">
      <h1>📸 Family Gallery</h1>

      <div className="gallery-form">
        <select
          name="memberId"
          value={formData.memberId}
          onChange={handleChange}
        >
          <option value="">Select Member</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>

          <option>Childhood</option>

          <option>School</option>

          <option>Graduation</option>

          <option>Wedding</option>

          <option>Family</option>

          <option>Other</option>
        </select>

        <input
          type="text"
          name="caption"
          placeholder="Caption"
          value={formData.caption}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];

            setSelectedFile(file);

            setPreview(URL.createObjectURL(file));
          }}
        />
        {preview && (
          <img src={preview} alt="preview" className="preview-image" />
        )}

        {editingId ? (
          <button onClick={updatePhoto}>Update Photo</button>
        ) : (
          <button onClick={addPhoto}>Upload Photo</button>
        )}
      </div>
      <h3>Filter Photos</h3>
      <div className="gallery-filters">
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
        >
          <option value="">All Members</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>

          <option value="Childhood">Childhood</option>

          <option value="School">School</option>

          <option value="Graduation">Graduation</option>

          <option value="Wedding">Wedding</option>

          <option value="Family">Family</option>

          <option value="Other">Other</option>
        </select>
      </div>

      <div className="gallery-grid">
        {photos

          .filter(
            (photo) =>
              memberFilter === "" ||
              photo.familyMember?.id === Number(memberFilter),
          )

          .filter(
            (photo) =>
              categoryFilter === "" || photo.category === categoryFilter,
          )

          .map((photo) => (
            <div key={photo.id} className="photo-card">
              <img
                src={`http://localhost:8080/uploads/${photo.imagePath}`}
                alt=""
              />

              <h3>{photo.caption}</h3>

              <p>{photo.category}</p>

              <p>{photo.familyMember?.fullName}</p>

              <div className="gallery-actions">
                <button onClick={() => editPhoto(photo)}>✏ Edit</button>

                <button onClick={() => deletePhoto(photo.id)}>🗑 Delete</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default GalleryPage;
