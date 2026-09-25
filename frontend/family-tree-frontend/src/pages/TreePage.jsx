import FamilyTree from "../components/FamilyTree";
import api from "../services/api";

import { useRef, useState } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function TreePage() {
  const treeRef = useRef(null);

  /*
   * React Flow instance.
   *
   * We use this only during export so that export is
   * independent of the user's current zoom/pan position.
   */
  const reactFlowInstanceRef = useRef(null);

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);

  /*
   * ============================================================
   * GET FAMILY TREE EXPORT TARGET
   * ============================================================
   */

  const getExportTarget = () => {
    if (!treeRef.current) {
      return null;
    }

    return treeRef.current.querySelector('[data-tree-export="family-tree"]');
  };

  /*
   * ============================================================
   * GET TREE VIEWPORT
   * ============================================================
   */

  const getFamilyTreeViewport = () => {
    if (!treeRef.current) {
      return null;
    }

    return treeRef.current.querySelector(".family-tree-viewport");
  };

  /*
   * ============================================================
   * GET ALL TREE SCROLL CONTAINERS
   * ============================================================
   */

  const getTreeScrollContainers = () => {
    if (!treeRef.current) {
      return [];
    }

    const containers = [];

    /*
     * Outer TreePage container.
     */

    containers.push(treeRef.current);

    /*
     * Inner FamilyTree viewport.
     */

    const familyTreeViewport = getFamilyTreeViewport();

    if (familyTreeViewport && !containers.includes(familyTreeViewport)) {
      containers.push(familyTreeViewport);
    }

    return containers;
  };

  /*
   * ============================================================
   * WAIT FOR IMAGES
   * ============================================================
   */

  const waitForImages = async (target) => {
    if (!target) {
      return;
    }

    const images = Array.from(target.querySelectorAll("img"));

    if (images.length === 0) {
      return;
    }

    await Promise.all(
      images.map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.addEventListener("load", resolve, { once: true });

            image.addEventListener("error", resolve, { once: true });
          }),
      ),
    );
  };

  /*
   * ============================================================
   * HIDE REACT FLOW CONTROLS DURING EXPORT
   * ============================================================
   */

  const prepareExport = (target) => {
    const elements = [
      ...target.querySelectorAll(".react-flow__controls"),

      ...target.querySelectorAll(".react-flow__minimap"),

      ...target.querySelectorAll(".react-flow__attribution"),
    ];

    const previousValues = elements.map((element) => ({
      element,
      display: element.style.display,
      visibility: element.style.visibility,
    }));

    elements.forEach((element) => {
      element.style.display = "none";
      element.style.visibility = "hidden";
    });

    return () => {
      previousValues.forEach(({ element, display, visibility }) => {
        element.style.display = display;
        element.style.visibility = visibility;
      });
    };
  };

  /*
   * ============================================================
   * SAVE + RESET SCROLL POSITIONS
   * ============================================================
   */

  const saveAndResetScrollPositions = () => {
    const containers = getTreeScrollContainers();

    const positions = containers.map((container) => ({
      container,

      scrollLeft: container.scrollLeft,

      scrollTop: container.scrollTop,

      scrollBehavior: container.style.scrollBehavior,
    }));

    containers.forEach((container) => {
      container.style.scrollBehavior = "auto";

      container.scrollLeft = 0;

      container.scrollTop = 0;
    });

    /*
     * Force layout.
     */

    containers.forEach((container) => {
      void container.offsetWidth;
    });

    return () => {
      positions.forEach(
        ({ container, scrollLeft, scrollTop, scrollBehavior }) => {
          container.style.scrollBehavior = "auto";

          container.scrollLeft = scrollLeft;

          container.scrollTop = scrollTop;

          container.style.scrollBehavior = scrollBehavior;
        },
      );
    };
  };

  /*
   * ============================================================
   * RESET REACT FLOW VIEWPORT FOR EXPORT
   * ============================================================
   *
   * THIS IS THE MAIN FIX.
   *
   * The tree itself is positioned using React Flow's viewport
   * transform because FamilyTree uses fitView.
   *
   * Previously our export code measured getBoundingClientRect()
   * values. Those values depend on the current React Flow
   * transform and therefore depend on where the user has
   * zoomed/scrolled.
   *
   * During export we instead force:
   *
   *     x    = 0
   *     y    = 0
   *     zoom = 1
   *
   * The complete tree is therefore rendered using its actual
   * coordinates inside family-tree-wrapper.
   * ============================================================
   */

  const saveAndResetReactFlowViewport = async () => {
    const instance = reactFlowInstanceRef.current;

    if (!instance) {
      console.warn(
        "React Flow instance is not available. Export will continue using the current viewport.",
      );

      return () => {};
    }

    /*
     * Get the user's current viewport.
     */

    const currentViewport = instance.getViewport();

    console.log("Original React Flow viewport:", currentViewport);

    /*
     * Reset to the actual tree coordinate system.
     */

    await instance.setViewport(
      {
        x: 0,
        y: 0,
        zoom: 1,
      },
      {
        duration: 0,
      },
    );

    /*
     * Give React Flow time to render the new transform.
     */

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    console.log("Export React Flow viewport:", instance.getViewport());

    /*
     * Restore user's viewport afterwards.
     */

    return async () => {
      try {
        await instance.setViewport(currentViewport, {
          duration: 0,
        });

        await new Promise((resolve) => {
          requestAnimationFrame(resolve);
        });

        console.log("React Flow viewport restored:", instance.getViewport());
      } catch (error) {
        console.warn("Unable to restore React Flow viewport:", error);
      }
    };
  };

  /*
   * ============================================================
   * SAFE CANVAS SCALE
   * ============================================================
   */

  const calculateSafeScale = (width, height) => {
    /*
     * Keep memory usage reasonable.
     *
     * This protects the browser from becoming unresponsive
     * when a very large family tree is exported.
     */

    const MAX_CANVAS_PIXELS = 18_000_000;

    const MAX_CANVAS_DIMENSION = 7000;

    const MAX_SCALE = 3;

    const area = Math.max(1, width * height);

    const pixelScale = Math.sqrt(MAX_CANVAS_PIXELS / area);

    const dimensionScale = Math.min(
      MAX_CANVAS_DIMENSION / Math.max(1, width),

      MAX_CANVAS_DIMENSION / Math.max(1, height),
    );

    let scale = Math.min(MAX_SCALE, pixelScale, dimensionScale);

    /*
     * Do not allow a tiny scale.
     */

    scale = Math.max(0.75, scale);

    return Number(scale.toFixed(2));
  };

  /*
   * ============================================================
   * CREATE COMPLETE TREE CANVAS
   * ============================================================
   */

  const createTreeCanvas = async () => {
    const target = getExportTarget();

    if (!treeRef.current) {
      throw new Error("Family tree container was not found.");
    }

    if (!target) {
      throw new Error("Family tree export area was not found.");
    }

    /*
     * ----------------------------------------------------------
     * PREPARE EXPORT UI
     * ----------------------------------------------------------
     */

    const restoreExportState = prepareExport(target);

    /*
     * ----------------------------------------------------------
     * SAVE + RESET SCROLL
     * ----------------------------------------------------------
     */

    const restoreScroll = saveAndResetScrollPositions();

    /*
     * ----------------------------------------------------------
     * SAVE + RESET REACT FLOW VIEWPORT
     * ----------------------------------------------------------
     */

    const restoreReactFlowViewport = await saveAndResetReactFlowViewport();

    try {
      /*
       * --------------------------------------------------------
       * WAIT FOR REACT FLOW TO FINISH REPOSITIONING
       * --------------------------------------------------------
       */

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      /*
       * --------------------------------------------------------
       * WAIT FOR MEMBER IMAGES
       * --------------------------------------------------------
       */

      await waitForImages(target);

      /*
       * --------------------------------------------------------
       * ALLOW ONE MORE PAINT
       * --------------------------------------------------------
       */

      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });

      /*
       * --------------------------------------------------------
       * IMPORTANT:
       *
       * DO NOT USE getRenderedTreeBounds()
       *
       * The FamilyTree component already calculates the exact
       * complete tree width and height and assigns those values
       * directly to family-tree-wrapper.
       *
       * Therefore the wrapper itself is our export boundary.
       * --------------------------------------------------------
       */

      const targetWidth = Math.ceil(
        target.scrollWidth || target.offsetWidth || target.clientWidth,
      );

      const targetHeight = Math.ceil(
        target.scrollHeight || target.offsetHeight || target.clientHeight,
      );

      /*
       * Use the actual CSS dimensions as a fallback.
       */

      const rect = target.getBoundingClientRect();

      const width = Math.max(1, targetWidth, Math.ceil(rect.width));

      const height = Math.max(1, targetHeight, Math.ceil(rect.height));

      /*
       * --------------------------------------------------------
       * SAFE SCALE
       * --------------------------------------------------------
       */

      const scale = calculateSafeScale(width, height);

      console.log("==========================================");

      console.log("FAMILY TREE EXPORT");

      console.log(
        "Outer scroll:",
        treeRef.current.scrollLeft,
        treeRef.current.scrollTop,
      );

      const viewport = getFamilyTreeViewport();

      if (viewport) {
        console.log("Inner scroll:", viewport.scrollLeft, viewport.scrollTop);
      }

      console.log(
        "React Flow viewport:",
        reactFlowInstanceRef.current
          ? reactFlowInstanceRef.current.getViewport()
          : "unavailable",
      );

      console.log("Complete tree target:", width, "x", height);

      console.log("Scale:", scale);

      console.log(
        "Canvas:",
        Math.round(width * scale),
        "x",
        Math.round(height * scale),
      );

      console.log("==========================================");

      /*
       * --------------------------------------------------------
       * CREATE CANVAS
       * --------------------------------------------------------
       */

      const canvas = await html2canvas(target, {
        backgroundColor: "#f8faf7",

        /*
         * Capture the COMPLETE wrapper.
         *
         * No crop based on screen coordinates.
         */

        x: 0,

        y: 0,

        width,

        height,

        scale,

        useCORS: true,

        allowTaint: false,

        imageTimeout: 15000,

        logging: false,

        /*
         * Ignore current page scrolling.
         */

        scrollX: 0,

        scrollY: 0,

        windowWidth: Math.max(
          document.documentElement.clientWidth,

          width,
        ),

        windowHeight: Math.max(
          document.documentElement.clientHeight,

          height,
        ),
      });

      return canvas;
    } finally {
      /*
       * Restore React Flow first.
       */

      await restoreReactFlowViewport();

      /*
       * Restore hidden controls.
       */

      restoreExportState();

      /*
       * Restore user's original scroll.
       */

      restoreScroll();
    }
  };

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

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Unable to export family tree:", error);

      alert("Unable to export family tree.");
    }
  };

  /*
   * ============================================================
   * EXPORT PNG
   * ============================================================
   */

  const exportPNG = async () => {
    if (isExportingPNG || isExportingPDF) {
      return;
    }

    try {
      setIsExportingPNG(true);

      const canvas = await createTreeCanvas();

      if (!canvas.width || !canvas.height) {
        throw new Error("Generated family tree image is empty.");
      }

      const dataUrl = canvas.toDataURL("image/png", 1.0);

      const link = document.createElement("a");

      link.download = "family-tree.png";

      link.href = dataUrl;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      /*
       * Release canvas memory.
       */

      canvas.width = 1;

      canvas.height = 1;
    } catch (error) {
      console.error("Unable to export PNG:", error);

      alert("Unable to export family tree as PNG.");
    } finally {
      setIsExportingPNG(false);
    }
  };

  /*
   * ============================================================
   * EXPORT PDF
   * ============================================================
   */

  const exportPDF = async () => {
    if (isExportingPDF || isExportingPNG) {
      return;
    }

    try {
      setIsExportingPDF(true);

      const canvas = await createTreeCanvas();

      if (!canvas.width || !canvas.height) {
        throw new Error("Generated family tree image is empty.");
      }

      /*
       * --------------------------------------------------------
       * IMAGE RATIO
       * --------------------------------------------------------
       */

      const imageRatio = canvas.width / canvas.height;

      /*
       * --------------------------------------------------------
       * AUTOMATIC ORIENTATION
       * --------------------------------------------------------
       */

      const orientation = imageRatio >= 1 ? "landscape" : "portrait";

      /*
       * --------------------------------------------------------
       * CREATE A4 PDF
       * --------------------------------------------------------
       */

      const pdf = new jsPDF(orientation, "mm", "a4", true);

      const pageWidth = pdf.internal.pageSize.getWidth();

      const pageHeight = pdf.internal.pageSize.getHeight();

      /*
       * --------------------------------------------------------
       * MARGIN
       * --------------------------------------------------------
       */

      const margin = 7;

      const availableWidth = pageWidth - margin * 2;

      const availableHeight = pageHeight - margin * 2;

      /*
       * --------------------------------------------------------
       * FIT COMPLETE TREE
       * --------------------------------------------------------
       */

      let imageWidth = availableWidth;

      let imageHeight = imageWidth / imageRatio;

      if (imageHeight > availableHeight) {
        imageHeight = availableHeight;

        imageWidth = imageHeight * imageRatio;
      }

      /*
       * Center image.
       */

      const x = (pageWidth - imageWidth) / 2;

      const y = (pageHeight - imageHeight) / 2;

      /*
       * --------------------------------------------------------
       * JPEG FOR PDF
       *
       * JPEG uses considerably less memory than embedding
       * a very large PNG into the PDF.
       * --------------------------------------------------------
       */

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      pdf.addImage(
        imgData,
        "JPEG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );

      pdf.save("family-tree.pdf");

      /*
       * Release canvas memory.
       */

      canvas.width = 1;

      canvas.height = 1;
    } catch (error) {
      console.error("Unable to export PDF:", error);

      alert("Unable to export family tree as PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <>
      <style>{`
        /* =====================================================
           TREE PAGE
        ===================================================== */

        .tree-page {
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;

          padding: 110px 28px 60px;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(190, 215, 176, 0.22),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 25%,
              rgba(203, 225, 216, 0.25),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #f8f7ef 0%,
              #f3f7f1 48%,
              #edf6f3 100%
            );

          color: #243126;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .tree-page-header {
          width: min(1400px, 100%);
          margin: 0 auto 28px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;

          padding: 28px 32px;

          box-sizing: border-box;

          background: rgba(
            255,
            255,
            255,
            0.88
          );

          border:
            1px solid
            rgba(
              93,
              113,
              86,
              0.12
            );

          border-radius: 24px;

          box-shadow:
            0 14px 40px
              rgba(
                54,
                72,
                54,
                0.08
              ),
            0 2px 8px
              rgba(
                54,
                72,
                54,
                0.04
              );

          backdrop-filter: blur(
            14px
          );
        }

        .tree-eyebrow {
          display: inline-block;

          margin-bottom: 8px;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: 3px;

          color: #718653;
        }

        .tree-page-header h1 {
          margin: 0;

          font-size:
            clamp(
              30px,
              4vw,
              46px
            );

          line-height: 1.05;

          font-weight: 800;

          letter-spacing: -1.5px;

          color: #243126;
        }

        .tree-page-header p {
          max-width: 650px;

          margin: 12px 0 0;

          font-size: 16px;

          line-height: 1.6;

          color: #69756a;
        }

        /* =====================================================
           EXPORT BUTTONS
        ===================================================== */

        .tree-export-actions {
          display: flex;

          align-items: center;

          gap: 10px;

          flex-shrink: 0;
        }

        .tree-export-actions button {
          min-width: 92px;

          padding: 11px 15px;

          border:
            1px solid
            #dce5d9;

          border-radius: 12px;

          background: #ffffff;

          color: #344536;

          font-size: 13px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            opacity 0.2s ease;
        }

        .tree-export-actions
          button:hover:not(:disabled) {
          transform:
            translateY(-2px);

          background: #f5f8f1;

          border-color: #c8d6bf;

          box-shadow:
            0 8px 20px
              rgba(
                65,
                83,
                61,
                0.10
              );
        }

        .tree-export-actions
          button:active:not(:disabled) {
          transform:
            translateY(0);
        }

        .tree-export-actions
          button:disabled {
          cursor: wait;

          opacity: 0.65;

          transform: none;

          box-shadow: none;
        }

        .tree-export-status {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          margin-left: 4px;

          padding: 8px 12px;

          border-radius: 10px;

          background: #f1f5ee;

          border:
            1px solid
            #dce5d9;

          color: #65715f;

          font-size: 12px;

          font-weight: 700;

          white-space: nowrap;
        }

        .tree-export-spinner {
          width: 12px;

          height: 12px;

          border:
            2px solid
            #cbd7c5;

          border-top-color:
            #718653;

          border-radius: 50%;

          animation:
            treeExportSpin
            0.8s linear infinite;
        }

        @keyframes treeExportSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* =====================================================
           TREE CONTAINER
        ===================================================== */

        .tree-container {
          width: min(1400px, 100%);

          min-height: 700px;

          margin: 0 auto;

          padding: 28px;

          box-sizing: border-box;

          background:
            rgba(
              255,
              255,
              255,
              0.92
            );

          border:
            1px solid
            rgba(
              91,
              110,
              87,
              0.12
            );

          border-radius: 28px;

          box-shadow:
            0 20px 55px
              rgba(
                51,
                68,
                51,
                0.10
              ),
            0 4px 12px
              rgba(
                51,
                68,
                51,
                0.04
              );

          overflow: auto;

          position: relative;
        }

        /* =====================================================
           SCROLLBAR
        ===================================================== */

        .tree-container::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .tree-container::-webkit-scrollbar-track {
          background: #eef2eb;

          border-radius: 10px;
        }

        .tree-container::-webkit-scrollbar-thumb {
          background: #c5d0bf;

          border-radius: 10px;
        }

        .tree-container::-webkit-scrollbar-thumb:hover {
          background: #aebca7;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {
          .tree-page {
            padding:
              95px
              16px
              40px;
          }

          .tree-page-header {
            flex-direction: column;

            align-items: flex-start;

            padding: 24px;

            border-radius: 20px;
          }

          .tree-export-actions {
            width: 100%;

            flex-wrap: wrap;
          }

          .tree-export-actions button {
            flex: 1;
          }

          .tree-container {
            padding: 16px;

            border-radius: 20px;
          }
        }

        @media (max-width: 560px) {
          .tree-page {
            padding:
              85px
              10px
              30px;
          }

          .tree-page-header {
            padding: 20px;
          }

          .tree-page-header h1 {
            font-size: 32px;
          }

          .tree-page-header p {
            font-size: 14px;
          }

          .tree-export-actions {
            flex-direction: column;

            align-items: stretch;
          }

          .tree-export-actions button {
            width: 100%;
          }

          .tree-export-status {
            justify-content: center;

            margin-left: 0;
          }

          .tree-container {
            min-height: 600px;

            padding: 10px;
          }
        }
      `}</style>

      <div className="tree-page">
        {/* ====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="tree-page-header">
          <div>
            <span className="tree-eyebrow">FAMILY TREE</span>

            <h1>Explore Your Family</h1>

            <p>
              Discover the relationships, stories and generations that connect
              your family.
            </p>
          </div>

          {/* ==================================================
              EXPORT ACTIONS
          =================================================== */}

          <div className="tree-export-actions">
            <button
              onClick={exportJSON}
              disabled={isExportingPDF || isExportingPNG}
            >
              📄 JSON
            </button>

            <button
              onClick={exportPNG}
              disabled={isExportingPDF || isExportingPNG}
            >
              {isExportingPNG ? "⏳ PNG..." : "🖼 PNG"}
            </button>

            <button
              onClick={exportPDF}
              disabled={isExportingPDF || isExportingPNG}
            >
              {isExportingPDF ? "⏳ PDF..." : "📑 PDF"}
            </button>

            {(isExportingPDF || isExportingPNG) && (
              <div className="tree-export-status">
                <span className="tree-export-spinner"></span>

                {isExportingPDF ? "Preparing PDF..." : "Preparing PNG..."}
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            FAMILY TREE
        ===================================================== */}

        <div ref={treeRef} className="tree-container">
          <FamilyTree
            onReactFlowInit={(instance) => {
              reactFlowInstanceRef.current = instance;
            }}
          />
        </div>
      </div>
    </>
  );
}

export default TreePage;
