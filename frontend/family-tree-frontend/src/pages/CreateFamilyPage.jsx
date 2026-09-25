import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function CreateFamilyPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a family name.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/families", {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      /*
       * Family has now been created and the
       * current user's family_id has been assigned.
       *
       * Go back to dashboard.
       */

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Create family error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to create family.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-family-page">
      <div className="create-family-background">
        <div className="family-orb orb-one"></div>

        <div className="family-orb orb-two"></div>

        <div className="family-orb orb-three"></div>

        <span className="family-leaf leaf-one">🍃</span>

        <span className="family-leaf leaf-two">🍂</span>

        <span className="family-leaf leaf-three">🍃</span>
      </div>

      <main className="create-family-container">
        <div className="create-family-tree">🌳</div>

        <span className="create-family-kicker">YOUR FAMILY STORY</span>

        <h1>
          Create your
          <span> family.</span>
        </h1>

        <p className="create-family-intro">
          Start a private space where your family's people, memories and
          relationships can grow together.
        </p>

        {error && <div className="create-family-error">{error}</div>}

        <form className="create-family-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="family-name">Family Name</label>

            <input
              id="family-name"
              type="text"
              name="name"
              placeholder="Example: The Subramani Family"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              disabled={loading}
            />

            <span className="field-hint">
              Give your family tree a name everyone will recognize.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="family-description">Family Description</label>

            <textarea
              id="family-description"
              name="description"
              placeholder="Tell your family members a little about this family..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              maxLength={500}
              disabled={loading}
            />

            <span className="field-hint">This can be changed later.</span>
          </div>

          <button
            type="submit"
            className="create-family-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Creating your family...
              </>
            ) : (
              <>
                <span>🌱</span>
                Create My Family
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          className="back-family-button"
          onClick={() => navigate("/dashboard")}
          disabled={loading}
        >
          ← Back to Family Gateway
        </button>

        <div className="create-family-note">
          <span>🔐</span>

          <p>
            Your family space is protected. Only members you invite can become
            part of your family tree.
          </p>
        </div>
      </main>
    </div>
  );
}

export default CreateFamilyPage;
