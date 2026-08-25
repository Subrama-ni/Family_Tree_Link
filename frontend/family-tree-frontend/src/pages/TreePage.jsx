import FamilyTree from "../components/FamilyTree";

import api from "../services/api";

import { toPng } from "html-to-image";

import { useRef } from "react";

import jsPDF from "jspdf";

import html2canvas from "html2canvas";

function TreePage() {
  const treeRef = useRef();

  /*
   * ============================================================
   * EXPORT JSON
   * ============================================================
   */

  const exportJSON = async () => {
    try {
      const membersResponse = await api.get("/api/members");

      const relationshipsResponse = await api.get("/api/relationships");

      const data = {
        members: membersResponse.data,

        relationships: relationshipsResponse.data,

        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "family-tree-backup.json";

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Unable to export family tree:", error);
    }
  };

  /*
   * ============================================================
   * EXPORT PNG
   * ============================================================
   */

  const exportPNG = async () => {
    try {
      if (!treeRef.current) {
        return;
      }

      const dataUrl = await toPng(treeRef.current, {
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");

      link.download = "family-tree.png";

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error("Unable to export PNG:", error);
    }
  };

  /*
   * ============================================================
   * EXPORT PDF
   * ============================================================
   */

  const exportPDF = async () => {
    try {
      if (!treeRef.current) {
        return;
      }

      const canvas = await html2canvas(treeRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();

      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth = pageWidth - margin * 2;

      const availableHeight = pageHeight - margin * 2;

      const imageRatio = canvas.width / canvas.height;

      let imageWidth = availableWidth;

      let imageHeight = imageWidth / imageRatio;

      if (imageHeight > availableHeight) {
        imageHeight = availableHeight;

        imageWidth = imageHeight * imageRatio;
      }

      const x = (pageWidth - imageWidth) / 2;

      const y = (pageHeight - imageHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imageWidth, imageHeight);

      pdf.save("family-tree.pdf");
    } catch (error) {
      console.error("Unable to export PDF:", error);
    }
  };

  return (
    <div className="tree-page">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="tree-page-header">
        <div>
          <span className="tree-eyebrow">FAMILY TREE</span>

          <h1>Explore Your Family</h1>

          <p>
            Discover the relationships, stories and generations that connect
            your family.
          </p>
        </div>

        {/* ====================================================
            EXPORT ACTIONS
        ===================================================== */}

        <div className="tree-export-actions">
          <button onClick={exportJSON}>📄 JSON</button>

          <button onClick={exportPNG}>🖼 PNG</button>

          <button onClick={exportPDF}>📑 PDF</button>
        </div>
      </div>

      {/* ======================================================
          FAMILY TREE
      ======================================================= */}

      <div ref={treeRef} className="tree-container">
        <FamilyTree />
      </div>
    </div>
  );
}

export default TreePage;
