import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const membersResponse = await axios.get(
        "http://localhost:8080/api/members",
      );

      const relationshipsResponse = await axios.get(
        "http://localhost:8080/api/relationships",
      );

      setMembers(membersResponse.data);

      setRelationships(relationshipsResponse.data);
    } catch (error) {
      console.log(error);
    }
  };

  const totalMembers = members.length;

  const maleCount = members.filter((member) => member.gender === "Male").length;

  const femaleCount = members.filter(
    (member) => member.gender === "Female",
  ).length;

  const occupationCount = new Set(members.map((member) => member.occupation))
    .size;
  const genderChartData = {
    labels: ["Male", "Female"],

    datasets: [
      {
        label: "Members",

        data: [maleCount, femaleCount],

        backgroundColor: ["#3b82f6", "#ec4899"],
      },
    ],
  };
  const occupationStats = members.reduce(
    (acc, member) => {
      const occupation = member.occupation || "Unknown";

      acc[occupation] = (acc[occupation] || 0) + 1;

      return acc;
    },

    {},
  );

  const occupationChartData = {
    labels: Object.keys(occupationStats),

    datasets: [
      {
        label: "Members",

        data: Object.values(occupationStats),

        backgroundColor: "#4ade80",
      },
    ],
  };
  const relationshipStats = relationships.reduce(
    (acc, relationship) => {
      const type = relationship.relationshipType;

      acc[type] = (acc[type] || 0) + 1;

      return acc;
    },

    {},
  );

  const relationshipChartData = {
    labels: Object.keys(relationshipStats),

    datasets: [
      {
        label: "Relationships",

        data: Object.values(relationshipStats),

        backgroundColor: "#60a5fa",
      },
    ],
  };
  const sortedMembers = [...members]
    .filter((member) => member.dateOfBirth)
    .sort((a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth));

  const oldestMember = sortedMembers.length > 0 ? sortedMembers[0] : null;

  const youngestMember =
    sortedMembers.length > 0 ? sortedMembers[sortedMembers.length - 1] : null;
  const occupationFrequency = members.reduce(
    (acc, member) => {
      const occupation = member.occupation || "Unknown";

      acc[occupation] = (acc[occupation] || 0) + 1;

      return acc;
    },

    {},
  );

  const mostCommonOccupation = Object.entries(occupationFrequency).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const generationCount = new Set(
    relationships

      .filter(
        (relationship) =>
          relationship.relationshipType === "Father" ||
          relationship.relationshipType === "Mother",
      )

      .map((relationship) => relationship.memberTwo?.id),
  ).size;
  const recentMembers = [...members]

    .sort((a, b) => b.id - a.id)

    .slice(0, 5);

  return (
    <div className="dashboard-page">
      <h1>📊 Family Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>{totalMembers}</h2>
          <p>Total Members</p>
        </div>

        <div className="dashboard-card">
          <h2>{maleCount}</h2>
          <p>Male Members</p>
        </div>

        <div className="dashboard-card">
          <h2>{femaleCount}</h2>
          <p>Female Members</p>
        </div>

        <div className="dashboard-card">
          <h2>{relationships.length}</h2>
          <p>Relationships</p>
        </div>

        <div className="dashboard-card">
          <h2>{occupationCount}</h2>
          <p>Occupations</p>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Oldest Member</h3>

            <p>{oldestMember?.fullName}</p>
          </div>

          <div className="analytics-card">
            <h3>Youngest Member</h3>

            <p>{youngestMember?.fullName}</p>
          </div>

          <div className="analytics-card">
            <h3>Top Occupation</h3>

            <p>{mostCommonOccupation?.[0]}</p>
          </div>

          <div className="analytics-card">
            <h3>Generations</h3>

            <p>{generationCount}</p>
          </div>
        </div>
        <div className="recent-members">
          <h2>Recent Members</h2>

          {recentMembers.map((member) => (
            <div key={member.id} className="recent-card">
              {member.fullName}
            </div>
          ))}
        </div>
      </div>
      <div className="charts-container"></div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Gender Distribution</h2>

          <Pie data={genderChartData} />
        </div>

        <div className="chart-card">
          <h2>Occupation Statistics</h2>

          <Bar data={occupationChartData} />
        </div>

        <div className="chart-card">
          <h2>Relationship Statistics</h2>

          <Bar data={relationshipChartData} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
