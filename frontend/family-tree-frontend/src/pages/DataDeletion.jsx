import React from "react";

function DataDeletion() {
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
          Data Deletion
        </h1>

        <p
          style={{
            color: "#777",
            marginBottom: "30px",
          }}
        >
          FamilyTree Link
        </p>

        <h2>Requesting Data Deletion</h2>

        <p>
          FamilyTree Link respects your right to control your personal
          information.
        </p>

        <p>
          If you would like to delete your FamilyTree Link account and
          associated personal information, you can submit a data deletion
          request to the application administrator.
        </p>

        <h2>What May Be Deleted</h2>

        <p>
          Depending on the deletion request, the following information may be
          removed:
        </p>

        <ul>
          <li>Your account information</li>
          <li>Your personal profile information</li>
          <li>Family member information created by you</li>
          <li>Family relationships created by you</li>
          <li>Uploaded photographs associated with your data</li>
          <li>Family stories and life events associated with your data</li>
        </ul>

        <h2>How to Request Deletion</h2>

        <p>
          To request deletion of your information, contact the FamilyTree Link
          application administrator and include the following information:
        </p>

        <ul>
          <li>Your registered email address</li>
          <li>Your FamilyTree Link account information</li>
          <li>A clear request to delete your data</li>
        </ul>

        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "#f1f7ee",
            borderRadius: "12px",
            border: "1px solid #dbe8d5",
          }}
        >
          <strong>Deletion Request</strong>

          <p style={{ marginBottom: 0 }}>
            Please contact the FamilyTree Link administrator using the
            support/contact method provided by the application.
          </p>
        </div>

        <h2>Facebook / Meta Data</h2>

        <p>
          If you used Facebook Login to access FamilyTree Link, you may also
          request deletion of the data associated with your Facebook
          authentication.
        </p>

        <p>
          Once a valid deletion request is received, FamilyTree Link will
          process the request and remove applicable information in accordance
          with the application's data retention requirements.
        </p>

        <h2>After Deletion</h2>

        <p>
          Once your information has been deleted, some information may no longer
          be recoverable.
        </p>

        <p>
          Certain information may be retained where required for legal,
          security, fraud-prevention, or technical purposes.
        </p>

        <h2>Need Help?</h2>

        <p>
          If you have questions about deleting your data, please contact the
          FamilyTree Link application administrator.
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

export default DataDeletion;
