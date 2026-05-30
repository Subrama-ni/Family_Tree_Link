import FamilyTree from "../components/FamilyTree";
import axios from "axios";
import { toPng } from "html-to-image";

import { useRef } from "react";
import jsPDF from "jspdf";

import html2canvas from "html2canvas";

function TreePage() {
  const exportJSON = async () => {
    try {
      const membersResponse = await axios.get(
        "http://localhost:8080/api/members",
      );

      const relationshipsResponse = await axios.get(
        "http://localhost:8080/api/relationships",
      );

      const data = {
        members: membersResponse.data,

        relationships: relationshipsResponse.data,

        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],

        {
          type: "application/json",
        },
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "family-tree-backup.json";

      link.click();
    } catch (error) {
      console.log(error);
    }
  };
  const treeRef = useRef();
  const exportPNG = async () => {
    try {
      const dataUrl = await toPng(treeRef.current);

      const link = document.createElement("a");

      link.download = "family-tree.png";

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.log(error);
    }
  };
  const exportPDF = async () => {
    const canvas = await html2canvas(treeRef.current);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "a4");

    pdf.addImage(
      imgData,

      "PNG",

      10,

      10,

      270,

      150,
    );

    pdf.save("family-tree.pdf");
  };
  return (
    <div className="tree-page">
      <div className="export-toolbar">
        <button onClick={exportJSON}>📄 JSON</button>

        <button onClick={exportPNG}>🖼 PNG</button>

        <button onClick={exportPDF}>📑 PDF</button>
      </div>
      <div ref={treeRef} className="tree-container">
        <FamilyTree />
      </div>
    </div>
  );
}

export default TreePage;
