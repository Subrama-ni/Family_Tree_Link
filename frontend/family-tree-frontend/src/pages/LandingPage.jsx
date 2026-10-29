import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const features = [
  {
    icon: "⌘",
    number: "01",
    title: "Interactive family tree",
    description:
      "Explore your family through a visual tree that brings generations and connections together.",
    className: "feature-green",
  },
  {
    icon: "♧",
    number: "02",
    title: "Family members",
    description:
      "Create meaningful member profiles with names, important dates, photos and personal details.",
    className: "feature-gold",
  },
  {
    icon: "∞",
    number: "03",
    title: "Relationships",
    description:
      "Connect relatives and make the relationships between generations easier to understand.",
    className: "feature-lilac",
  },
  {
    icon: "◷",
    number: "04",
    title: "Family timeline",
    description:
      "Keep birthdays, milestones, memorable moments and important family events in one place.",
    className: "feature-blue",
  },
  {
    icon: "▧",
    number: "05",
    title: "Photo gallery",
    description:
      "Bring family memories together in a dedicated space for the photos you treasure.",
    className: "feature-pink",
  },
  {
    icon: "↗",
    number: "06",
    title: "Family invitations",
    description:
      "Invite relatives to join your family space and participate in preserving your shared story.",
    className: "feature-orange",
  },
];

const familyMembers = [
  {
    name: "Grandfather",
    role: "Generation 1",
    symbol: "G",
    color: "avatar-gold",
  },
  { name: "Father", role: "Generation 2", symbol: "F", color: "avatar-green" },
  { name: "Mother", role: "Generation 2", symbol: "M", color: "avatar-pink" },
  { name: "You", role: "Generation 3", symbol: "Y", color: "avatar-blue" },
];

const steps = [
  {
    number: "01",
    title: "Create your family",
    description:
      "Start your own family space and give your shared story a home.",
  },
  {
    number: "02",
    title: "Add your members",
    description: "Build profiles for the people who make your family unique.",
  },
  {
    number: "03",
    title: "Connect relationships",
    description:
      "Link family members and explore how your generations connect.",
  },
  {
    number: "04",
    title: "Preserve your story",
    description:
      "Collect important dates, photographs and memories in one place.",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="ft-section-label">
      <span className="ft-label-dot" />
      {children}
    </div>
  );
}

function ArrowIcon({ diagonal = false }) {
  return (
    <span className="ft-arrow-icon" aria-hidden="true">
      {diagonal ? "↗" : "→"}
    </span>
  );
}

function PrimaryButton({ children, onClick, small = false, type = "button" }) {
  return (
    <button
      className={`ft-button ${small ? "ft-button-small" : ""}`}
      type={type}
      onClick={onClick}
    >
      <span className="ft-button-label">{children}</span>
      <ArrowIcon diagonal />
    </button>
  );
}

function FamilyTreePreview() {
  return (
    <div className="ft-tree-visual" aria-label="Illustration of a family tree">
      <div className="ft-orbit ft-orbit-one" />
      <div className="ft-orbit ft-orbit-two" />

      <div className="ft-tree-heading">
        <span className="ft-tree-heading-icon">✳</span>
        <div>
          <strong>Our family</strong>
          <span>A story across generations</span>
        </div>
        <span className="ft-live-dot" />
      </div>

      <div className="ft-tree-canvas">
        <svg
          className="ft-tree-connectors"
          viewBox="0 0 360 290"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M180 60 V95 H92 V128" />
          <path d="M180 95 H268 V128" />
          <path d="M92 177 V208 H180 V225" />
          <path d="M268 177 V208 H180" />
        </svg>

        <div className="ft-person ft-person-grand">
          <div className="ft-person-avatar avatar-gold">G</div>
          <strong>Grandparents</strong>
          <span>Generation 1</span>
        </div>

        <div className="ft-person ft-person-father">
          <div className="ft-person-avatar avatar-green">F</div>
          <strong>Father</strong>
          <span>Generation 2</span>
        </div>

        <div className="ft-person ft-person-mother">
          <div className="ft-person-avatar avatar-pink">M</div>
          <strong>Mother</strong>
          <span>Generation 2</span>
        </div>

        <div className="ft-person ft-person-you">
          <div className="ft-person-avatar avatar-blue">Y</div>
          <strong>You</strong>
          <span>Generation 3</span>
        </div>
      </div>

      <div className="ft-tree-footer">
        <div className="ft-mini-avatars" aria-hidden="true">
          <span>G</span>
          <span>F</span>
          <span>M</span>
          <span>Y</span>
        </div>
        <div className="ft-tree-footer-copy">
          <strong>Your story, connected.</strong>
          <span>A visual family tree preview</span>
        </div>
        <span className="ft-footer-sparkle">✦</span>
      </div>

      <div className="ft-float-note ft-note-top">
        <span className="ft-note-icon">♡</span>
        <div>
          <strong>Made for family</strong>
          <span>Every generation matters</span>
        </div>
      </div>

      <div className="ft-float-note ft-note-bottom">
        <span className="ft-note-icon ft-note-icon-gold">✦</span>
        <div>
          <strong>Memories that last</strong>
          <span>Keep your story together</span>
        </div>
      </div>
    </div>
  );
}

function TimelinePreview() {
  return (
    <div className="ft-timeline-card">
      <div className="ft-preview-heading">
        <div>
          <span className="ft-preview-eyebrow">YOUR FAMILY STORY</span>
          <h3>Little moments. Big memories.</h3>
        </div>
        <span className="ft-preview-icon">◷</span>
      </div>

      <div className="ft-timeline-list">
        <div className="ft-timeline-item">
          <div className="ft-timeline-marker marker-gold">✦</div>
          <div className="ft-timeline-content">
            <span className="ft-timeline-date">A SPECIAL DAY</span>
            <strong>Family celebration</strong>
            <p>Make space for moments worth remembering.</p>
          </div>
        </div>

        <div className="ft-timeline-item">
          <div className="ft-timeline-marker marker-green">♡</div>
          <div className="ft-timeline-content">
            <span className="ft-timeline-date">A HAPPY MEMORY</span>
            <strong>Together through generations</strong>
            <p>Keep meaningful milestones close to your heart.</p>
          </div>
        </div>

        <div className="ft-timeline-item">
          <div className="ft-timeline-marker marker-lilac">✿</div>
          <div className="ft-timeline-content">
            <span className="ft-timeline-date">A FAMILY TRADITION</span>
            <strong>Stories passed down</strong>
            <p>Celebrate the moments that shape your family.</p>
          </div>
        </div>
      </div>
      <p className="ft-demo-note">
        Illustrative preview · Add your own family events
      </p>
    </div>
  );
}

function GalleryPreview() {
  return (
    <div className="ft-gallery-card">
      <div className="ft-gallery-header">
        <div>
          <span className="ft-preview-eyebrow">THE MEMORY CORNER</span>
          <h3>Every picture tells a story.</h3>
        </div>
        <span className="ft-gallery-symbol">▧</span>
      </div>

      <div className="ft-memory-grid">
        <div className="ft-memory-tile memory-tile-large">
          <span className="ft-memory-art art-sun">☀</span>
          <span className="ft-memory-caption">Golden moments</span>
        </div>
        <div className="ft-memory-tile memory-tile-green">
          <span className="ft-memory-art">❋</span>
          <span className="ft-memory-caption">Together</span>
        </div>
        <div className="ft-memory-tile memory-tile-lilac">
          <span className="ft-memory-art">✿</span>
          <span className="ft-memory-caption">Our traditions</span>
        </div>
        <div className="ft-memory-tile memory-tile-pink">
          <span className="ft-memory-art">♡</span>
          <span className="ft-memory-caption">Always family</span>
        </div>
      </div>

      <p className="ft-demo-note">
        Illustrative preview · Your gallery can hold your memories
      </p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("ft-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ft-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  const goToSection = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToRegister = () => navigate("/register");
  const goToLogin = () => navigate("/login");

  return (
    <main className="ft-page">
      <div className="ft-background-glow ft-glow-one" aria-hidden="true" />
      <div className="ft-background-glow ft-glow-two" aria-hidden="true" />

      <header className="ft-navbar">
        <button
          className="ft-brand"
          onClick={() => goToSection("home")}
          aria-label="Family Tree Link home"
        >
          <span className="ft-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <path
                d="M20 5 32 12v14L20 33 8 26V12L20 5Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M20 12v9m0-5-6-4m6 4 6-4M20 21l-6 4m6-4 6 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="20" cy="11" r="2.4" fill="currentColor" />
              <circle cx="13" cy="12" r="2.4" fill="currentColor" />
              <circle cx="27" cy="12" r="2.4" fill="currentColor" />
              <circle cx="20" cy="22" r="2.4" fill="currentColor" />
              <circle cx="13" cy="26" r="2.4" fill="currentColor" />
              <circle cx="27" cy="26" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span className="ft-brand-name">
            Family Tree<span>Link</span>
          </span>
        </button>

        <button
          className="ft-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`ft-nav-links ${menuOpen ? "ft-nav-open" : ""}`}>
          <button onClick={() => goToSection("features")}>Features</button>
          <button onClick={() => goToSection("tour")}>Explore</button>
          <button onClick={() => goToSection("journey")}>How it works</button>
          <button onClick={() => goToSection("about")}>Our purpose</button>

          <div className="ft-mobile-actions">
            <button className="ft-login-button" onClick={goToLogin}>
              Log in
            </button>
            <PrimaryButton onClick={goToRegister} small>
              Get started
            </PrimaryButton>
          </div>
        </nav>

        <div className="ft-desktop-actions">
          <button className="ft-login-button" onClick={goToLogin}>
            Log in
          </button>
          <PrimaryButton onClick={goToRegister} small>
            Get started
          </PrimaryButton>
        </div>
      </header>

      <section className="ft-hero" id="home">
        <div className="ft-hero-copy">
          <SectionLabel>YOUR FAMILY. YOUR STORY.</SectionLabel>

          <h1>
            Every connection
            <br />
            tells a <span className="ft-heading-highlight">story.</span>
          </h1>

          <p className="ft-hero-description">
            Your family is more than names on a tree. It is a collection of
            people, memories and moments that deserve to be connected and
            remembered.
          </p>

          <div className="ft-hero-actions">
            <PrimaryButton onClick={goToRegister}>
              Start your family tree
            </PrimaryButton>
            <button
              className="ft-secondary-button"
              onClick={() => goToSection("tour")}
            >
              <span className="ft-play-icon">▷</span>
              Explore the experience
            </button>
          </div>

          <div className="ft-hero-note">
            <span className="ft-note-check">✓</span>
            <span>A meaningful space for your family story</span>
          </div>

          <div className="ft-hero-decoration" aria-hidden="true">
            <span>✳</span>
            <span>✦</span>
            <span>·</span>
          </div>
        </div>

        <div className="ft-hero-art">
          <div className="ft-hero-art-backdrop" aria-hidden="true">
            <span className="ft-honeycomb honeycomb-a" />
            <span className="ft-honeycomb honeycomb-b" />
            <span className="ft-honeycomb honeycomb-c" />
            <span className="ft-honeycomb honeycomb-d" />
            <span className="ft-honeycomb honeycomb-e" />
          </div>
          <FamilyTreePreview />
        </div>

        <button
          className="ft-scroll-cue"
          onClick={() => goToSection("introduction")}
          aria-label="Scroll to discover more"
        >
          <span className="ft-scroll-line" />
          Discover more
          <span className="ft-scroll-chevron">↓</span>
        </button>
      </section>

      <section className="ft-introduction" id="introduction" data-reveal>
        <div className="ft-intro-symbol" aria-hidden="true">
          <span>✳</span>
        </div>
        <div className="ft-intro-copy">
          <SectionLabel>A HOME FOR YOUR HISTORY</SectionLabel>
          <h2>
            Your roots connect you.
            <br />
            Your stories bring you <span>closer.</span>
          </h2>
        </div>
        <p className="ft-intro-description">
          Family Tree Link brings your family connections, profiles, events and
          memories into one organized space. Build your family tree at your own
          pace and give the next generation a way to explore where they come
          from.
        </p>
      </section>

      <section className="ft-features-section" id="features">
        <div className="ft-section-heading" data-reveal>
          <SectionLabel>ONE FAMILY. MANY STORIES.</SectionLabel>
          <h2>
            Everything your family
            <br />
            story needs.
          </h2>
          <p>
            Discover the tools that help you connect generations and keep
            important memories together.
          </p>
        </div>

        <div className="ft-feature-grid">
          {features.map((feature, index) => (
            <article
              className={`ft-feature-card ${feature.className}`}
              key={feature.number}
              data-reveal
              style={{ "--ft-delay": `${index * 85}ms` }}
            >
              <div className="ft-feature-card-top">
                <span className="ft-feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <span className="ft-feature-number">{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <button
                className="ft-feature-link"
                onClick={goToRegister}
                aria-label={`Get started with ${feature.title}`}
              >
                Explore feature <ArrowIcon />
              </button>
              <span className="ft-feature-watermark" aria-hidden="true">
                {feature.icon}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="ft-tour-section" id="tour">
        <div className="ft-tour-copy" data-reveal>
          <SectionLabel>SEE THE CONNECTIONS</SectionLabel>
          <h2>
            More than names.
            <br />
            <span>A living family tree.</span>
          </h2>
          <p>
            Picture your family history as a connected story. Understand
            relationships at a glance, explore different generations and build a
            clearer picture of the people who came before you.
          </p>

          <ul className="ft-check-list">
            <li>
              <span>✓</span>
              Visual family relationships
            </li>
            <li>
              <span>✓</span>
              Dedicated member profiles
            </li>
            <li>
              <span>✓</span>A central place for family memories
            </li>
          </ul>

          <PrimaryButton onClick={goToRegister}>
            Build your family tree
          </PrimaryButton>
        </div>

        <div className="ft-dashboard-window" data-reveal>
          <div className="ft-window-topbar">
            <div className="ft-window-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="ft-window-title">Family Tree Link</span>
            <span className="ft-window-status">
              <i /> Family preview
            </span>
          </div>

          <div className="ft-window-body">
            <aside className="ft-window-sidebar">
              <div className="ft-sidebar-brand">✳</div>
              <span className="sidebar-active">⌘</span>
              <span>♧</span>
              <span>◷</span>
              <span>▧</span>
            </aside>

            <div className="ft-window-main">
              <div className="ft-window-welcome">
                <div>
                  <span className="ft-preview-eyebrow">YOUR SPACE</span>
                  <h3>Our family tree</h3>
                  <p>A little history. A lot of heart.</p>
                </div>
                <div className="ft-window-avatar">F</div>
              </div>

              <div className="ft-window-stat-row">
                <div className="ft-window-stat">
                  <span className="stat-icon stat-icon-green">♧</span>
                  <div>
                    <span>Members</span>
                    <strong>Connected</strong>
                  </div>
                </div>
                <div className="ft-window-stat">
                  <span className="stat-icon stat-icon-gold">✦</span>
                  <div>
                    <span>Family story</span>
                    <strong>Growing</strong>
                  </div>
                </div>
              </div>

              <div className="ft-window-tree">
                <div className="ft-window-tree-title">
                  <strong>Generations together</strong>
                  <span>Illustration</span>
                </div>
                <div className="ft-mini-tree">
                  <div className="ft-mini-tree-row">
                    <span className="mini-person mini-gold">G</span>
                  </div>
                  <div className="ft-mini-tree-branch" />
                  <div className="ft-mini-tree-row">
                    <span className="mini-person mini-green">F</span>
                    <span className="mini-person mini-pink">M</span>
                  </div>
                  <div className="ft-mini-tree-branch mini-branch-bottom" />
                  <div className="ft-mini-tree-row">
                    <span className="mini-person mini-blue">Y</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ft-window-caption">
            <span>✦</span> A visual preview of a connected family experience
          </div>
        </div>
      </section>

      <section className="ft-memory-section" data-reveal>
        <div className="ft-memory-copy">
          <SectionLabel>KEEP THE MOMENTS CLOSE</SectionLabel>
          <h2>
            From your oldest
            <br />
            stories to <span>today.</span>
          </h2>
          <p>
            The smallest moments often become the stories we treasure most.
            Bring important family milestones and meaningful photographs
            together in one place.
          </p>
          <button
            className="ft-secondary-button ft-secondary-outline"
            onClick={goToRegister}
          >
            Make room for memories <ArrowIcon diagonal />
          </button>
        </div>

        <div className="ft-memory-previews">
          <TimelinePreview />
          <GalleryPreview />
        </div>
      </section>

      <section className="ft-journey-section" id="journey">
        <div className="ft-section-heading" data-reveal>
          <SectionLabel>YOUR STORY STARTS HERE</SectionLabel>
          <h2>
            Four simple steps.
            <br />
            <span>Generations of meaning.</span>
          </h2>
          <p>
            Start small, add what you know and let your family history grow
            naturally over time.
          </p>
        </div>

        <div className="ft-journey-grid">
          {steps.map((step, index) => (
            <article
              className="ft-journey-step"
              key={step.number}
              data-reveal
              style={{ "--ft-delay": `${index * 100}ms` }}
            >
              <div className="ft-journey-number">
                <span>{step.number}</span>
                {index < steps.length - 1 && (
                  <span className="ft-journey-line" aria-hidden="true" />
                )}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="ft-journey-cta" data-reveal>
          <div className="ft-journey-cta-symbol" aria-hidden="true">
            ✳
          </div>
          <div>
            <strong>Your family story can start today.</strong>
            <span>Every connection is a new chapter.</span>
          </div>
          <PrimaryButton onClick={goToRegister}>
            Begin your journey
          </PrimaryButton>
        </div>
      </section>

      <section className="ft-purpose-section" id="about" data-reveal>
        <div className="ft-purpose-art" aria-hidden="true">
          <div className="ft-purpose-hex ft-purpose-hex-one">♡</div>
          <div className="ft-purpose-hex ft-purpose-hex-two">✦</div>
          <div className="ft-purpose-hex ft-purpose-hex-three">✿</div>
          <div className="ft-purpose-center">Family</div>
        </div>

        <div className="ft-purpose-copy">
          <SectionLabel>BUILT AROUND WHAT MATTERS</SectionLabel>
          <h2>
            Because family
            <br />
            is <span>worth remembering.</span>
          </h2>
          <p>
            Family Tree Link is designed to help you organize the people,
            relationships and memories that make your family unique. Build a
            family space that can grow as your story continues.
          </p>
          <div className="ft-purpose-note">
            <span>“</span>
            <p>The best family stories are the ones we keep sharing.</p>
          </div>
        </div>
      </section>

      <section className="ft-final-cta" data-reveal>
        <div
          className="ft-cta-decoration ft-cta-decoration-one"
          aria-hidden="true"
        >
          ⬡
        </div>
        <div
          className="ft-cta-decoration ft-cta-decoration-two"
          aria-hidden="true"
        >
          ✳
        </div>
        <div className="ft-cta-content">
          <span className="ft-cta-eyebrow">
            YOUR PEOPLE. YOUR HISTORY. YOUR LEGACY.
          </span>
          <h2>
            Every family has a story.
            <br />
            <span>Let's connect yours.</span>
          </h2>
          <p>
            Create your family space and start bringing generations closer, one
            connection at a time.
          </p>
          <PrimaryButton onClick={goToRegister}>
            Create your family tree
          </PrimaryButton>
          <span className="ft-cta-footnote">
            Already a member?{" "}
            <button onClick={goToLogin}>Log in to your account</button>
          </span>
        </div>
      </section>

      <footer className="ft-footer">
        <button
          className="ft-brand ft-footer-brand"
          onClick={() => goToSection("home")}
        >
          <span className="ft-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <path
                d="M20 5 32 12v14L20 33 8 26V12L20 5Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M20 12v9m0-5-6-4m6 4 6-4M20 21l-6 4m6-4 6 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="20" cy="11" r="2.4" fill="currentColor" />
              <circle cx="13" cy="12" r="2.4" fill="currentColor" />
              <circle cx="27" cy="12" r="2.4" fill="currentColor" />
              <circle cx="20" cy="22" r="2.4" fill="currentColor" />
              <circle cx="13" cy="26" r="2.4" fill="currentColor" />
              <circle cx="27" cy="26" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span className="ft-brand-name">
            Family Tree<span>Link</span>
          </span>
        </button>

        <p>Connecting generations, preserving stories.</p>

        <div className="ft-footer-links">
          <button onClick={() => goToSection("features")}>Features</button>
          <button onClick={goToLogin}>Log in</button>
          <button onClick={goToRegister}>Get started</button>
        </div>

        <div className="ft-footer-bottom">
          <span>© {new Date().getFullYear()} Family Tree Link</span>
          <span>
            Made for the stories that connect us.{" "}
            <span className="ft-footer-heart">♡</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
