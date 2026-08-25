import { useEffect, useState } from "react";
import axios from "axios";

function GalleryPage() {
  const API_URL = "http://localhost:8080";

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

  // Filters
  const [memberFilter, setMemberFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const getAuthConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchMembers();
    fetchPhotos();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/members`,
        getAuthConfig(),
      );

      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/photos`,
        getAuthConfig(),
      );

      setPhotos(response.data);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setEditingId(null);

    setSelectedFile(null);

    setPreview("");

    setFormData({
      memberId: "",
      category: "",
      caption: "",
      imagePath: "",
    });
  };

  const addPhoto = async () => {
    try {
      if (!formData.memberId) {
        alert("Please select a family member.");
        return;
      }

      if (!selectedFile) {
        alert("Please select an image.");
        return;
      }

      if (!formData.category) {
        alert("Please select a category.");
        return;
      }

      /*
       * Step 1:
       * Upload image and verify member ownership.
       */
      const uploadData = new FormData();

      uploadData.append("file", selectedFile);

      uploadData.append("memberId", formData.memberId);

      const uploadResponse = await axios.post(
        `${API_URL}/api/photos/upload`,
        uploadData,
        getAuthConfig(),
      );

      /*
       * Step 2:
       * Save photo metadata.
       */
      await axios.post(
        `${API_URL}/api/photos`,
        {
          imagePath: uploadResponse.data,

          caption: formData.caption,

          category: formData.category,

          familyMember: {
            id: formData.memberId,
          },
        },
        getAuthConfig(),
      );

      await fetchPhotos();

      resetForm();

      alert("Photo uploaded successfully.");
    } catch (error) {
      console.error("Photo upload failed:", error);

      alert(error.response?.data || "Failed to upload photo.");
    }
  };

  const editPhoto = (photo) => {
    setEditingId(photo.id);

    setFormData({
      memberId: photo.familyMember?.id || "",

      category: photo.category || "",

      caption: photo.caption || "",

      imagePath: photo.imagePath || "",
    });

    setPreview(`${API_URL}/uploads/${photo.imagePath}`);

    setSelectedFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updatePhoto = async () => {
    try {
      if (!formData.memberId) {
        alert("Please select a family member.");
        return;
      }

      let imagePath = formData.imagePath;

      /*
       * If a new image was selected,
       * upload the replacement image.
       */
      if (selectedFile) {
        const uploadData = new FormData();

        uploadData.append("file", selectedFile);

        uploadData.append("memberId", formData.memberId);

        const uploadResponse = await axios.post(
          `${API_URL}/api/photos/upload`,
          uploadData,
          getAuthConfig(),
        );

        imagePath = uploadResponse.data;
      }

      await axios.put(
        `${API_URL}/api/photos/${editingId}`,
        {
          imagePath,

          caption: formData.caption,

          category: formData.category,

          familyMember: {
            id: formData.memberId,
          },
        },
        getAuthConfig(),
      );

      await fetchPhotos();

      resetForm();

      alert("Photo updated successfully.");
    } catch (error) {
      console.error("Photo update failed:", error);

      alert(error.response?.data || "Failed to update photo.");
    }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/photos/${id}`, getAuthConfig());

      await fetchPhotos();

      alert("Photo deleted successfully.");
    } catch (error) {
      console.error("Photo deletion failed:", error);

      alert(error.response?.data || "Failed to delete photo.");
    }
  };

  /*
   * ============================================================
   * FILTERING
   * ============================================================
   */

  const filteredPhotos = photos.filter((photo) => {
    const matchesMember =
      !memberFilter || String(photo.familyMember?.id) === String(memberFilter);

    const matchesCategory =
      !categoryFilter || photo.category === categoryFilter;

    return matchesMember && matchesCategory;
  });

  return (
    <div className="gallery-page">
      <h1>📸 Family Gallery</h1>

      {/* =====================================================
          GALLERY FORM
      ====================================================== */}

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

          <option value="Childhood">Childhood</option>

          <option value="School">School</option>

          <option value="Graduation">Graduation</option>

          <option value="Wedding">Wedding</option>

          <option value="Family">Family</option>

          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="caption"
          placeholder="Caption"
          value={formData.caption}
          onChange={handleChange}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <img src={preview} alt="Preview" className="preview-image" />
        )}

        {editingId ? (
          <>
            <button onClick={updatePhoto}>Update Photo</button>

            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={addPhoto}>Upload Photo</button>
        )}
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

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

        <button
          type="button"
          onClick={() => {
            setMemberFilter("");
            setCategoryFilter("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* =====================================================
          GALLERY GRID
      ====================================================== */}

      <div className="gallery-grid">
        {filteredPhotos.length === 0 ? (
          <div className="empty-gallery">
            <h3>No photos found</h3>

            <p>Upload your first family memory to get started.</p>
          </div>
        ) : (
          filteredPhotos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img
                src={`${API_URL}/uploads/${photo.imagePath}`}
                alt={photo.caption || "Family memory"}
              />

              <div className="photo-info">
                <h3>{photo.caption || "Untitled Memory"}</h3>

                <p>🏷️ {photo.category}</p>

                <p>👤 {photo.familyMember?.fullName || "Unknown Member"}</p>
              </div>

              <div className="gallery-actions">
                <button type="button" onClick={() => editPhoto(photo)}>
                  ✏️ Edit
                </button>

                <button type="button" onClick={() => deletePhoto(photo.id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
