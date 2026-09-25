import { useNavigate } from "react-router-dom";

function FamilySetupPage() {
  const navigate = useNavigate();

  return (
    <main className="family-setup-page">
      <div className="family-setup-background">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <section className="family-setup-card">
        <div className="family-setup-tree">🌳</div>

        <span className="family-setup-kicker">WELCOME TO FAMILY TREE LINK</span>

        <h1>
          Your family story
          <span> starts here.</span>
        </h1>

        <p className="family-setup-description">
          Your account is ready. Now choose how you'd like to begin your family
          journey.
        </p>

        <div className="family-setup-options">
          {/* JOIN FAMILY */}

          <button
            type="button"
            className="family-setup-option family-setup-join"
            onClick={() => navigate("/family-invitations")}
          >
            <div className="family-setup-option-icon">💌</div>

            <div className="family-setup-option-content">
              <span className="family-setup-option-label">
                HAVE AN INVITATION?
              </span>

              <h2>Join a Family</h2>

              <p>
                Join your family's existing tree using an invitation from a
                family member.
              </p>
            </div>

            <span className="family-setup-arrow">→</span>
          </button>

          {/* CREATE FAMILY */}

          <button
            type="button"
            className="family-setup-option family-setup-create"
            onClick={() => navigate("/create-family")}
          >
            <div className="family-setup-option-icon">🌱</div>

            <div className="family-setup-option-content">
              <span className="family-setup-option-label">
                START SOMETHING NEW
              </span>

              <h2>Create a Family</h2>

              <p>Create your own family tree and become its family owner.</p>
            </div>

            <span className="family-setup-arrow">→</span>
          </button>
        </div>

        <div className="family-setup-note">
          <span>🔒</span>
          <span>You can only belong to one family at a time.</span>
        </div>
      </section>
    </main>
  );
}

export default FamilySetupPage;
