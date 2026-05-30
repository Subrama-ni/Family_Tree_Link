import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import axios from "axios";

function MemberProfile() {
  const { id } = useParams();

  const [member, setMember] = useState(null);

  useEffect(() => {
    fetchMember();
  }, []);

  const fetchMember = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/members");

      const foundMember = response.data.find((m) => m.id === parseInt(id));

      setMember(foundMember);
    } catch (error) {
      console.log(error);
    }
  };

  if (!member) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <img
            src={member.imagePath || "https://via.placeholder.com/200"}
            alt="member"
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "20px",
              objectFit: "cover",
              border: "5px solid #4CAF50",
            }}
          />

          <div>
            <h1
              style={{
                marginBottom: "15px",
              }}
            >
              {member.fullName}
            </h1>

            <h3
              style={{
                color: "#4CAF50",
                marginBottom: "15px",
              }}
            >
              {member.occupation}
            </h3>

            <p>
              <b>Gender:</b> {member.gender}
            </p>

            <p>
              <b>Date of Birth:</b> {member.dateOfBirth}
            </p>
          </div>
        </div>

        <hr
          style={{
            margin: "40px 0",
          }}
        />

        <h2
          style={{
            marginBottom: "20px",
          }}
        >
          Biography
        </h2>

        <p
          style={{
            lineHeight: "1.8",
            fontSize: "18px",
            color: "#444",
          }}
        >
          {member.biography}
        </p>
      </div>
    </div>
  );
}

export default MemberProfile;
