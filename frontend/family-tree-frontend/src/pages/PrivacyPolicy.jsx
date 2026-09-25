import React from "react";

function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7faf5",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          lineHeight: "1.7",
          color: "#333",
        }}
      >
        <h1
          style={{
            color: "#365a35",
            marginBottom: "10px",
          }}
        >
          Privacy Policy
        </h1>

        <p
          style={{
            color: "#777",
            marginBottom: "30px",
          }}
        >
          Last updated: September 10, 2026
        </p>

        <p>
          Welcome to <strong>FamilyTree Link</strong>. We respect your privacy
          and are committed to protecting the information you provide while
          using our application.
        </p>

        <h2>1. Information We Collect</h2>

        <p>
          FamilyTree Link may collect information that you voluntarily provide
          while creating and managing your family tree.
        </p>

        <p>This may include:</p>

        <ul>
          <li>Family member names</li>
          <li>Date of birth</li>
          <li>Gender</li>
          <li>Occupation</li>
          <li>Biography and family information</li>
          <li>Family relationships</li>
          <li>Profile photographs</li>
          <li>Life events added to family members</li>
          <li>Account information required to use the application</li>
        </ul>

        <h2>2. How We Use Your Information</h2>

        <p>
          Information provided to FamilyTree Link is used to provide and improve
          the application's family tree functionality.
        </p>

        <p>This includes:</p>

        <ul>
          <li>Creating and displaying family trees</li>
          <li>Managing family members</li>
          <li>Displaying family relationships</li>
          <li>Displaying family photographs</li>
          <li>Storing family stories and life events</li>
          <li>Providing account-related functionality</li>
          <li>Improving application performance and security</li>
        </ul>

        <h2>3. Family Information</h2>

        <p>
          FamilyTree Link allows users to voluntarily enter information about
          their family members. Users are responsible for ensuring that they
          have appropriate permission to provide information about other
          individuals.
        </p>

        <h2>4. Photos and Uploaded Content</h2>

        <p>
          Users may upload photographs and other information to create their
          family tree. Uploaded content is used to provide the family tree
          functionality requested by the user.
        </p>

        <h2>5. Third-Party Services</h2>

        <p>
          FamilyTree Link may use third-party services to provide
          authentication, hosting, analytics, infrastructure, or other
          application functionality.
        </p>

        <p>
          Where third-party services are used, information may be processed
          according to the privacy policies of those services.
        </p>

        <h2>6. Facebook / Meta Login</h2>

        <p>
          If FamilyTree Link provides Facebook or Meta authentication, users may
          choose to sign in using their Facebook account.
        </p>

        <p>
          When Facebook Login is used, FamilyTree Link may receive information
          permitted by the Facebook authentication process, such as the user's
          basic profile information and email address where permitted.
        </p>

        <p>
          FamilyTree Link does not request or store Facebook information beyond
          what is necessary to provide the application's functionality.
        </p>

        <h2>7. Data Security</h2>

        <p>
          We take reasonable measures to protect information stored within
          FamilyTree Link against unauthorized access, alteration, disclosure,
          or destruction.
        </p>

        <p>
          However, no internet-based service can guarantee complete security of
          information.
        </p>

        <h2>8. Data Retention</h2>

        <p>
          Information is retained for as long as necessary to provide the
          services of FamilyTree Link or until the user requests deletion,
          subject to applicable legal and technical requirements.
        </p>

        <h2>9. Data Deletion</h2>

        <p>
          Users may request deletion of their account and associated personal
          information.
        </p>

        <p>
          Please visit our{" "}
          <a
            href="/data-deletion"
            style={{
              color: "#527d4e",
              fontWeight: "600",
            }}
          >
            Data Deletion
          </a>{" "}
          page for information about requesting deletion.
        </p>

        <h2>10. Children's Privacy</h2>

        <p>
          FamilyTree Link is not intended to knowingly collect personal
          information directly from children without appropriate parental or
          guardian involvement.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>

        <p>
          This Privacy Policy may be updated from time to time. Any updated
          version will be published on this page with an updated revision date.
        </p>

        <h2>12. Contact Us</h2>

        <p>
          If you have questions about this Privacy Policy or your personal
          information, please contact the FamilyTree Link application
          administrator.
        </p>

        <hr
          style={{
            margin: "35px 0 20px",
            border: "none",
            borderTop: "1px solid #e5e7e3",
          }}
        />

        <p
          style={{
            fontSize: "13px",
            color: "#888",
            textAlign: "center",
          }}
        >
          © 2026 FamilyTree Link. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
