import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* ================================
          NAVIGATION
      ================================= */}

      <header className="landing-navbar">
        <div
          className="landing-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="landing-brand-mark">
            <span className="brand-root"></span>
            <span className="brand-branch branch-left"></span>
            <span className="brand-branch branch-right"></span>
            <span className="brand-leaf leaf-one"></span>
            <span className="brand-leaf leaf-two"></span>
            <span className="brand-leaf leaf-three"></span>
            <span className="brand-leaf leaf-four"></span>
          </div>

          <div className="landing-brand-name">
            <span>Family</span>
            <strong>Tree</strong>
            <span>Link</span>
          </div>
        </div>

        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#memories">Memories</a>
        </nav>

        <div className="landing-nav-actions">
          <button
            className="landing-login-button"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>

          <button
            className="landing-signup-button"
            onClick={() => navigate("/register")}
          >
            Get started
            <span>→</span>
          </button>
        </div>
      </header>

      {/* ================================
          HERO
      ================================= */}

      <main>
        <section className="landing-hero">
          <div className="hero-background-glow hero-glow-one"></div>
          <div className="hero-background-glow hero-glow-two"></div>

          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot"></span>
              YOUR FAMILY. YOUR STORY. YOUR LEGACY.
            </div>

            <h1>
              Every family has
              <br />a story worth <em>remembering.</em>
            </h1>

            <p className="hero-description">
              Build your family tree, connect generations, preserve precious
              memories, and keep your family's story alive for generations to
              come.
            </p>

            <div className="hero-actions">
              <button
                className="hero-primary-button"
                onClick={() => navigate("/register")}
              >
                <span>Start your family tree</span>
                <span className="hero-button-arrow">→</span>
              </button>

              <button
                className="hero-secondary-button"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works
                <span>↓</span>
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>R</span>
                <span>S</span>
                <span>A</span>
                <span>M</span>
              </div>

              <div className="trust-text">
                <strong>Built for families</strong>
                <span>Connect the generations that matter.</span>
              </div>
            </div>
          </div>

          {/* ================================
              HERO TREE VISUAL
          ================================= */}

          <div className="hero-tree-container">
            <div className="tree-orbit orbit-large"></div>
            <div className="tree-orbit orbit-small"></div>

            <div className="hero-tree-glow"></div>

            <div className="family-tree-visual">
              <div className="tree-line vertical-line main-line"></div>
              <div className="tree-line horizontal-line main-horizontal"></div>

              <div className="tree-line vertical-line child-line-left"></div>
              <div className="tree-line vertical-line child-line-right"></div>

              <div className="tree-line horizontal-line children-horizontal"></div>

              <div className="family-person person-grandfather">
                <div className="person-avatar avatar-one">R</div>
                <span>Grandfather</span>
              </div>

              <div className="family-person person-grandmother">
                <div className="person-avatar avatar-two">A</div>
                <span>Grandmother</span>
              </div>

              <div className="family-person person-parent">
                <div className="person-avatar avatar-three">S</div>
                <span>Parent</span>
              </div>

              <div className="family-person person-spouse">
                <div className="person-avatar avatar-four">M</div>
                <span>Spouse</span>
              </div>

              <div className="family-person person-child-one">
                <div className="person-avatar avatar-five">K</div>
                <span>Child</span>
              </div>

              <div className="family-person person-child-two">
                <div className="person-avatar avatar-six">N</div>
                <span>Child</span>
              </div>

              <div className="tree-center-node">
                <div className="center-tree-icon">✦</div>
                <strong>Your Family</strong>
                <span>Connected across generations</span>
              </div>
            </div>

            <div className="tree-floating-card floating-card-top">
              <span className="floating-icon">✦</span>
              <div>
                <strong>4 generations</strong>
                <small>connected</small>
              </div>
            </div>

            <div className="tree-floating-card floating-card-bottom">
              <span className="floating-icon">♡</span>
              <div>
                <strong>Memories</strong>
                <small>preserved forever</small>
              </div>
            </div>
          </div>
        </section>

        {/* ================================
            INTRO
        ================================= */}

        <section className="landing-intro">
          <div className="section-label">A PLACE FOR YOUR STORY</div>

          <h2>
            More than a family tree.
            <br />
            <span>A home for your family's history.</span>
          </h2>

          <p>
            Family Tree Link brings your people, relationships, memories, and
            stories together in one beautiful place.
          </p>
        </section>

        {/* ================================
            FEATURES
        ================================= */}

        <section className="landing-features" id="features">
          <div className="section-heading">
            <div className="section-label">WHAT YOU CAN DO</div>

            <h2>
              Everything your family
              <br />
              needs to stay <em>connected.</em>
            </h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card feature-card-large">
              <div className="feature-number">01</div>

              <div className="feature-icon">⌘</div>

              <h3>Build your family tree</h3>

              <p>
                Map generations, relationships, parents, children, and partners
                in a visual family tree that grows with your family.
              </p>

              <div className="mini-tree-preview">
                <span></span>
                <i></i>
                <span></span>
                <i></i>
                <span></span>
              </div>
            </article>

            <article className="feature-card">
              <div className="feature-number">02</div>

              <div className="feature-icon">♡</div>

              <h3>Preserve memories</h3>

              <p>
                Keep photographs, stories, milestones, and meaningful moments
                connected to the people who lived them.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-number">03</div>

              <div className="feature-icon">∞</div>

              <h3>Connect generations</h3>

              <p>
                Invite family members and create a shared space where everyone
                can discover where they belong.
              </p>
            </article>

            <article className="feature-card feature-card-wide">
              <div className="feature-number">04</div>

              <div className="feature-icon">◷</div>

              <div>
                <h3>Tell the story through time</h3>

                <p>
                  From the earliest memories to the newest generation, create a
                  timeline that makes your family's journey easy to explore.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ================================
            HOW IT WORKS
        ================================= */}

        <section className="landing-how-it-works" id="how-it-works">
          <div className="how-content">
            <div className="section-label">HOW IT WORKS</div>

            <h2>
              Start with one person.
              <br />
              <em>Build something timeless.</em>
            </h2>

            <p>
              Creating your family tree is simple. Start with yourself or a
              family member and gradually connect the generations around you.
            </p>

            <div className="steps">
              <div className="step">
                <span>01</span>
                <div>
                  <h3>Create your family</h3>
                  <p>Start a private space for your family.</p>
                </div>
              </div>

              <div className="step">
                <span>02</span>
                <div>
                  <h3>Add your people</h3>
                  <p>Build relationships between generations.</p>
                </div>
              </div>

              <div className="step">
                <span>03</span>
                <div>
                  <h3>Invite your family</h3>
                  <p>Bring the people you love into the story.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="how-visual">
            <div className="how-visual-card">
              <div className="visual-card-header">
                <span>Family Tree</span>
                <span>● Connected</span>
              </div>

              <div className="visual-tree">
                <div className="visual-node visual-node-top">
                  <span>R</span>
                  <strong>Robert</strong>
                </div>

                <div className="visual-connector"></div>

                <div className="visual-node-row">
                  <div className="visual-node">
                    <span>A</span>
                    <strong>Anna</strong>
                  </div>

                  <div className="visual-node visual-node-highlight">
                    <span>S</span>
                    <strong>You</strong>
                  </div>

                  <div className="visual-node">
                    <span>M</span>
                    <strong>Michael</strong>
                  </div>
                </div>

                <div className="visual-connector connector-bottom"></div>

                <div className="visual-node-row children">
                  <div className="visual-node">
                    <span>K</span>
                    <strong>Kay</strong>
                  </div>

                  <div className="visual-node">
                    <span>N</span>
                    <strong>Noah</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================
            MEMORIES
        ================================= */}

        <section className="landing-memories" id="memories">
          <div className="memories-heading">
            <div className="section-label">THE MEMORIES BETWEEN THE NAMES</div>

            <h2>
              Because a family tree
              <br />
              should feel <em>alive.</em>
            </h2>

            <p>
              Names tell you who someone was. Stories tell you why they
              mattered.
            </p>
          </div>

          <div className="memory-cards">
            <article className="memory-card">
              <div className="memory-image memory-image-one">
                <span>Family Stories</span>
              </div>

              <div className="memory-card-content">
                <small>STORIES</small>
                <h3>Remember the stories behind the names.</h3>
              </div>
            </article>

            <article className="memory-card">
              <div className="memory-image memory-image-two">
                <span>Moments</span>
              </div>

              <div className="memory-card-content">
                <small>MEMORIES</small>
                <h3>Keep the moments that made your family.</h3>
              </div>
            </article>

            <article className="memory-card">
              <div className="memory-image memory-image-three">
                <span>Generations</span>
              </div>

              <div className="memory-card-content">
                <small>LEGACY</small>
                <h3>Give the next generation a story to discover.</h3>
              </div>
            </article>
          </div>
        </section>

        {/* ================================
            PRIVACY
        ================================= */}

        <section className="landing-privacy">
          <div className="privacy-symbol">⌘</div>

          <div>
            <div className="section-label">YOUR FAMILY. YOUR SPACE.</div>

            <h2>Your family's story belongs to your family.</h2>

            <p>
              Family Tree Link is designed around the idea that your family's
              history should remain yours. We'll make privacy and control a
              fundamental part of the experience.
            </p>
          </div>
        </section>

        {/* ================================
            CTA
        ================================= */}

        <section className="landing-cta">
          <div className="cta-glow"></div>

          <div className="section-label">YOUR STORY STARTS HERE</div>

          <h2>
            Start building the tree
            <br />
            your family will <em>remember.</em>
          </h2>

          <p>One person. One story. One connection at a time.</p>

          <button className="cta-button" onClick={() => navigate("/register")}>
            Create your family tree
            <span>→</span>
          </button>
        </section>
      </main>

      {/* ================================
          FOOTER
      ================================= */}

      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="footer-brand-mark">✦</div>

          <div>
            <strong>Family Tree Link</strong>
            <span>Connected across generations.</span>
          </div>
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#memories">Memories</a>
          <button onClick={() => navigate("/login")}>Log in</button>
          <button onClick={() => navigate("/register")}>Get started</button>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Family Tree Link</span>
          <span>Preserve what matters.</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
