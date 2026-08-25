import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

import api from "../services/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * FETCH DASHBOARD DATA
   * ============================================================
   */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const membersResponse = await api.get("/api/members");
      const relationshipsResponse = await api.get("/api/relationships");

      setMembers(membersResponse.data);
      setRelationships(relationshipsResponse.data);
    } catch (error) {
      console.error("Dashboard data error:", error);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * BASIC STATISTICS
   * ============================================================
   */

  const totalMembers = members.length;

  const maleCount = members.filter((member) => member.gender === "Male").length;

  const femaleCount = members.filter(
    (member) => member.gender === "Female",
  ).length;

  const occupationCount = new Set(
    members.map((member) => member.occupation).filter(Boolean),
  ).size;

  /*
   * ============================================================
   * OCCUPATION STATISTICS
   * ============================================================
   */

  const occupationStats = members.reduce((acc, member) => {
    const occupation = member.occupation || "Unknown";

    acc[occupation] = (acc[occupation] || 0) + 1;

    return acc;
  }, {});

  /*
   * ============================================================
   * RELATIONSHIP STATISTICS
   * ============================================================
   */

  const relationshipStats = relationships.reduce((acc, relationship) => {
    const type = relationship.relationshipType || "Unknown";

    acc[type] = (acc[type] || 0) + 1;

    return acc;
  }, {});

  /*
   * ============================================================
   * OLDEST / YOUNGEST
   * ============================================================
   */

  const sortedMembers = [...members]
    .filter((member) => member.dateOfBirth)
    .sort((a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth));

  const oldestMember = sortedMembers.length > 0 ? sortedMembers[0] : null;

  const youngestMember =
    sortedMembers.length > 0 ? sortedMembers[sortedMembers.length - 1] : null;

  /*
   * ============================================================
   * MOST COMMON OCCUPATION
   * ============================================================
   */

  const occupationFrequency = members.reduce((acc, member) => {
    const occupation = member.occupation || "Unknown";

    acc[occupation] = (acc[occupation] || 0) + 1;

    return acc;
  }, {});

  const mostCommonOccupation = Object.entries(occupationFrequency).sort(
    (a, b) => b[1] - a[1],
  )[0];

  /*
   * ============================================================
   * GENERATIONS
   * ============================================================
   *
   * Preserving your existing logic:
   * Father/Mother relationships are used to estimate generations.
   */

  const generationCount = new Set(
    relationships
      .filter(
        (relationship) =>
          relationship.relationshipType === "Father" ||
          relationship.relationshipType === "Mother",
      )
      .map((relationship) => relationship.memberTwo?.id),
  ).size;

  /*
   * ============================================================
   * RECENT MEMBERS
   * ============================================================
   */

  const recentMembers = [...members].sort((a, b) => b.id - a.id).slice(0, 5);

  /*
   * ============================================================
   * CHART DATA
   * ============================================================
   */

  const genderChartData = {
    labels: ["Male", "Female"],

    datasets: [
      {
        label: "Members",

        data: [maleCount, femaleCount],

        backgroundColor: ["#3b82f6", "#ec4899"],

        borderWidth: 0,
      },
    ],
  };

  const occupationChartData = {
    labels: Object.keys(occupationStats),

    datasets: [
      {
        label: "Members",

        data: Object.values(occupationStats),

        backgroundColor: "#6f7f42",

        borderRadius: 10,
      },
    ],
  };

  const relationshipChartData = {
    labels: Object.keys(relationshipStats),

    datasets: [
      {
        label: "Relationships",

        data: Object.values(relationshipStats),

        backgroundColor: "#7d9360",

        borderRadius: 10,
      },
    ],
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="dashboard-page cinematic-dashboard">
        <div className="dashboard-loading cinematic-loading">
          <div className="loading-orbit">
            <div className="loading-tree">🌳</div>
          </div>

          <h2>Growing your family story...</h2>

          <p>Connecting members, relationships and memories.</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="dashboard-page cinematic-dashboard">
        <div className="dashboard-error cinematic-error">
          <div className="error-icon">🌿</div>

          <h2>Something interrupted the family story</h2>

          <p>{error}</p>

          <button onClick={fetchData}>Try Again</button>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <div className="dashboard-page cinematic-dashboard">
      {/* ========================================================
          AMBIENT BACKGROUND
      ========================================================= */}

      <div className="dashboard-ambient">
        <span className="ambient-orb orb-one"></span>
        <span className="ambient-orb orb-two"></span>
        <span className="ambient-orb orb-three"></span>

        <span className="floating-leaf leaf-one">🍃</span>
        <span className="floating-leaf leaf-two">🍃</span>
        <span className="floating-leaf leaf-three">🍂</span>
        <span className="floating-leaf leaf-four">🍃</span>
      </div>

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="family-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>

            <span>YOUR FAMILY STORY</span>

            <span className="eyebrow-line"></span>
          </div>

          <h1>
            Every family
            <span> has a story.</span>
          </h1>

          <p className="hero-description">
            Discover the people, relationships and memories that connect your
            family across generations.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{totalMembers}</strong>
              <span>Members</span>
            </div>

            <div className="hero-divider"></div>

            <div className="hero-stat">
              <strong>{generationCount || 0}</strong>
              <span>Generations</span>
            </div>

            <div className="hero-divider"></div>

            <div className="hero-stat">
              <strong>{relationships.length}</strong>
              <span>Connections</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/tree" className="hero-primary-button">
              <span>Explore Family Tree</span>
              <span className="button-arrow">→</span>
            </Link>

            <Link to="/members" className="hero-secondary-button">
              Meet the Family
            </Link>
          </div>
        </div>

        {/* ======================================================
            FAMILY CONSTELLATION
        ======================================================= */}

        <div className="family-visual">
          <div className="constellation-glow"></div>

          <div className="constellation">
            <div className="constellation-line line-one"></div>
            <div className="constellation-line line-two"></div>
            <div className="constellation-line line-three"></div>
            <div className="constellation-line line-four"></div>
            <div className="constellation-line line-five"></div>

            <div className="constellation-person person-one">
              <span>👴</span>
            </div>

            <div className="constellation-person person-two">
              <span>👵</span>
            </div>

            <div className="constellation-person person-three">
              <span>👨</span>
            </div>

            <div className="constellation-person person-four">
              <span>👩</span>
            </div>

            <div className="constellation-person person-five">
              <span>🧑</span>
            </div>

            <div className="constellation-center">
              <span>🌳</span>
            </div>
          </div>

          <div className="visual-caption">
            <span className="caption-dot"></span>

            <span>Connected by family</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          STORY INTRO
      ========================================================= */}

      <section className="story-intro">
        <span className="section-kicker">FAMILY OVERVIEW</span>

        <h2>
          A living story,
          <span> growing through generations.</span>
        </h2>

        <p>
          Your family tree isn't just a collection of names. It's a story of
          people, connections and moments passed from one generation to another.
        </p>
      </section>

      {/* ========================================================
          STATISTICS
      ========================================================= */}

      <section className="cinematic-stat-grid">
        <div className="cinematic-stat-card stat-members">
          <div className="stat-card-glow"></div>

          <div className="stat-icon">👥</div>

          <div className="stat-number">{totalMembers}</div>

          <div className="stat-label">Family Members</div>

          <div className="stat-description">
            People who make your family story unique.
          </div>
        </div>

        <div className="cinematic-stat-card stat-men">
          <div className="stat-card-glow"></div>

          <div className="stat-icon">♂</div>

          <div className="stat-number">{maleCount}</div>

          <div className="stat-label">Male Members</div>

          <div className="stat-description">
            Men connected to your family tree.
          </div>
        </div>

        <div className="cinematic-stat-card stat-women">
          <div className="stat-card-glow"></div>

          <div className="stat-icon">♀</div>

          <div className="stat-number">{femaleCount}</div>

          <div className="stat-label">Female Members</div>

          <div className="stat-description">
            Women who are part of your family story.
          </div>
        </div>

        <div className="cinematic-stat-card stat-connections">
          <div className="stat-card-glow"></div>

          <div className="stat-icon">🔗</div>

          <div className="stat-number">{relationships.length}</div>

          <div className="stat-label">Connections</div>

          <div className="stat-description">
            Relationships connecting your family.
          </div>
        </div>
      </section>

      {/* ========================================================
          FAMILY JOURNEY
      ========================================================= */}

      <section className="family-journey">
        <div className="journey-heading">
          <div>
            <span className="section-kicker">FAMILY JOURNEY</span>

            <h2>
              From one generation
              <span> to the next.</span>
            </h2>
          </div>

          <Link to="/timeline" className="journey-link">
            View Timeline →
          </Link>
        </div>

        <div className="journey-track">
          <div className="journey-line">
            <span className="journey-progress"></span>
          </div>

          <div className="journey-points">
            <div className="journey-point">
              <div className="journey-dot">👴</div>

              <div className="journey-content">
                <span className="journey-date">OLDEST GENERATION</span>

                <h3>{oldestMember?.fullName || "Your family begins here"}</h3>

                <p>{oldestMember?.occupation || "Family Member"}</p>
              </div>
            </div>

            <div className="journey-point">
              <div className="journey-dot">🌿</div>

              <div className="journey-content">
                <span className="journey-date">FAMILY CONNECTIONS</span>

                <h3>{relationships.length} relationships</h3>

                <p>Connections that bring your family together.</p>
              </div>
            </div>

            <div className="journey-point">
              <div className="journey-dot">🧑</div>

              <div className="journey-content">
                <span className="journey-date">YOUNGEST GENERATION</span>

                <h3>{youngestMember?.fullName || "Your story continues"}</h3>

                <p>{youngestMember?.occupation || "Family Member"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAMILY SPOTLIGHT
      ========================================================= */}

      <section className="family-spotlight">
        <div className="spotlight-heading">
          <div>
            <span className="section-kicker">FAMILY SPOTLIGHT</span>

            <h2>
              Meet the people
              <span> behind the story.</span>
            </h2>
          </div>

          <Link to="/members" className="spotlight-link">
            View All Members →
          </Link>
        </div>

        <div className="spotlight-grid">
          {recentMembers.length === 0 ? (
            <div className="empty-dashboard">
              <div>🌱</div>

              <h3>Your family story is waiting.</h3>

              <p>Add your first family member to begin.</p>

              <Link to="/members">Add Family Member →</Link>
            </div>
          ) : (
            recentMembers.map((member, index) => (
              <div
                key={member.id}
                className="spotlight-card"
                style={{
                  "--card-index": index,
                }}
              >
                <div className="spotlight-image">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} />
                  ) : (
                    <div className="spotlight-avatar">
                      {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}

                  <div className="spotlight-image-overlay"></div>

                  <span className="spotlight-gender">
                    {member.gender === "Female"
                      ? "♀"
                      : member.gender === "Male"
                        ? "♂"
                        : "•"}
                  </span>
                </div>

                <div className="spotlight-info">
                  <h3>{member.fullName}</h3>

                  <p>{member.occupation || "Family Member"}</p>

                  {member.dateOfBirth && (
                    <span className="spotlight-date">
                      🎂 {member.dateOfBirth}
                    </span>
                  )}
                </div>

                <div className="spotlight-card-number">0{index + 1}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================
          FAMILY INSIGHTS
      ========================================================= */}

      <section className="family-insights">
        <div className="insights-heading">
          <span className="section-kicker">FAMILY INSIGHTS</span>

          <h2>
            The numbers behind
            <span> your story.</span>
          </h2>
        </div>

        <div className="insights-highlight-grid">
          <div className="insight-highlight">
            <span className="insight-icon">🎂</span>

            <div>
              <span className="insight-label">OLDEST MEMBER</span>

              <strong>{oldestMember?.fullName || "Not available"}</strong>
            </div>
          </div>

          <div className="insight-highlight">
            <span className="insight-icon">🌱</span>

            <div>
              <span className="insight-label">YOUNGEST MEMBER</span>

              <strong>{youngestMember?.fullName || "Not available"}</strong>
            </div>
          </div>

          <div className="insight-highlight">
            <span className="insight-icon">💼</span>

            <div>
              <span className="insight-label">MOST COMMON OCCUPATION</span>

              <strong>{mostCommonOccupation?.[0] || "Not available"}</strong>
            </div>
          </div>

          <div className="insight-highlight">
            <span className="insight-icon">🌳</span>

            <div>
              <span className="insight-label">FAMILY GENERATIONS</span>

              <strong>{generationCount || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ANALYTICS
      ========================================================= */}

      <section className="cinematic-analytics">
        <div className="analytics-heading">
          <span className="section-kicker">FAMILY ANALYTICS</span>

          <h2>
            See your family
            <span> from another perspective.</span>
          </h2>
        </div>

        <div className="charts-grid cinematic-charts">
          <div className="chart-card cinematic-chart-card">
            <div className="chart-card-heading">
              <div>
                <span className="chart-kicker">FAMILY</span>

                <h3>Gender Distribution</h3>
              </div>

              <span className="chart-icon">👥</span>
            </div>

            <div className="chart-wrapper">
              <Pie
                data={genderChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card cinematic-chart-card">
            <div className="chart-card-heading">
              <div>
                <span className="chart-kicker">PEOPLE</span>

                <h3>Occupation Statistics</h3>
              </div>

              <span className="chart-icon">💼</span>
            </div>

            <div className="chart-wrapper">
              <Bar
                data={occupationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      display: false,
                    },
                  },

                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card cinematic-chart-card">
            <div className="chart-card-heading">
              <div>
                <span className="chart-kicker">CONNECTIONS</span>

                <h3>Relationship Statistics</h3>
              </div>

              <span className="chart-icon">🔗</span>
            </div>

            <div className="chart-wrapper">
              <Bar
                data={relationshipChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      display: false,
                    },
                  },

                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL CTA
      ========================================================= */}

      <section className="family-final-cta">
        <div className="cta-glow"></div>

        <div className="cta-tree">🌳</div>

        <span className="section-kicker">YOUR STORY CONTINUES</span>

        <h2>
          There's always another
          <span> branch to discover.</span>
        </h2>

        <p>
          Explore your family tree, add new members, preserve memories and keep
          your family's story alive for generations to come.
        </p>

        <div className="cta-actions">
          <Link to="/tree" className="hero-primary-button">
            Explore the Family Tree
            <span className="button-arrow">→</span>
          </Link>

          <Link to="/timeline" className="hero-secondary-button">
            Discover the Timeline
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
