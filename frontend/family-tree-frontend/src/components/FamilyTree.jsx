import React, { useEffect, useMemo, useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

import api from "../services/api";

import FamilyNode from "./FamilyNode";

const nodeTypes = {
  familyNode: FamilyNode,
};

/*
 * ============================================================
 * TREE CONFIGURATION
 * ============================================================
 */

const NODE_WIDTH = 220;
const NODE_HEIGHT = 250;

const HORIZONTAL_GAP = 90;
const GENERATION_GAP = 150;

const ROOT_WIDTH = 260;

/*
 * ============================================================
 * RELATIONSHIP VISUAL CONFIGURATION
 * ============================================================
 */

const relationshipVisuals = {
  Husband: {
    color: "#c77988",
    labelColor: "#a65366",
    background: "rgba(255, 245, 247, 0.96)",
    className: "relationship-spouse",
  },

  Wife: {
    color: "#c77988",
    labelColor: "#a65366",
    background: "rgba(255, 245, 247, 0.96)",
    className: "relationship-spouse",
  },

  Spouse: {
    color: "#c77988",
    labelColor: "#a65366",
    background: "rgba(255, 245, 247, 0.96)",
    className: "relationship-spouse",
  },

  Father: {
    color: "#789456",
    labelColor: "#58703e",
    background: "rgba(244, 249, 237, 0.96)",
    className: "relationship-parent",
  },

  Mother: {
    color: "#789456",
    labelColor: "#58703e",
    background: "rgba(244, 249, 237, 0.96)",
    className: "relationship-parent",
  },

  Parent: {
    color: "#789456",
    labelColor: "#58703e",
    background: "rgba(244, 249, 237, 0.96)",
    className: "relationship-parent",
  },

  Son: {
    color: "#789456",
    labelColor: "#58703e",
    background: "rgba(244, 249, 237, 0.96)",
    className: "relationship-child",
  },

  Daughter: {
    color: "#789456",
    labelColor: "#58703e",
    background: "rgba(244, 249, 237, 0.96)",
    className: "relationship-child",
  },

  Brother: {
    color: "#638bb5",
    labelColor: "#466e99",
    background: "rgba(240, 247, 255, 0.96)",
    className: "relationship-sibling",
  },

  Sister: {
    color: "#638bb5",
    labelColor: "#466e99",
    background: "rgba(240, 247, 255, 0.96)",
    className: "relationship-sibling",
  },

  Grandfather: {
    color: "#b19650",
    labelColor: "#8d7337",
    background: "rgba(252, 248, 232, 0.96)",
    className: "relationship-grand",
  },

  Grandmother: {
    color: "#b19650",
    labelColor: "#8d7337",
    background: "rgba(252, 248, 232, 0.96)",
    className: "relationship-grand",
  },

  Grandson: {
    color: "#b19650",
    labelColor: "#8d7337",
    background: "rgba(252, 248, 232, 0.96)",
    className: "relationship-grand",
  },

  Granddaughter: {
    color: "#b19650",
    labelColor: "#8d7337",
    background: "rgba(252, 248, 232, 0.96)",
    className: "relationship-grand",
  },

  Uncle: {
    color: "#8a70ad",
    labelColor: "#6d5292",
    background: "rgba(248, 243, 255, 0.96)",
    className: "relationship-extended",
  },

  Aunt: {
    color: "#8a70ad",
    labelColor: "#6d5292",
    background: "rgba(248, 243, 255, 0.96)",
    className: "relationship-extended",
  },

  Nephew: {
    color: "#8a70ad",
    labelColor: "#6d5292",
    background: "rgba(248, 243, 255, 0.96)",
    className: "relationship-extended",
  },

  Niece: {
    color: "#8a70ad",
    labelColor: "#6d5292",
    background: "rgba(248, 243, 255, 0.96)",
    className: "relationship-extended",
  },

  Cousin: {
    color: "#55a39b",
    labelColor: "#3c8179",
    background: "rgba(238, 252, 249, 0.96)",
    className: "relationship-cousin",
  },

  Other: {
    color: "#a18b58",
    labelColor: "#806c3e",
    background: "rgba(250, 247, 237, 0.96)",
    className: "relationship-other",
  },
};

/*
 * ============================================================
 * RELATIONSHIP HELPERS
 * ============================================================
 */

/*
 * Father / Mother / Parent
 *
 * memberOne = parent
 * memberTwo = child
 */

const isParentRelationship = (type) => {
  return type === "Father" || type === "Mother" || type === "Parent";
};

/*
 * Son / Daughter are the reverse semantic direction.
 *
 * Example:
 *
 * Subramani -- Son --> Thullasi
 *
 * means:
 *
 * Thullasi --> Subramani
 */

const isChildRelationship = (type) => {
  return type === "Son" || type === "Daughter";
};

const isSpouseRelationship = (type) => {
  return type === "Husband" || type === "Wife" || type === "Spouse";
};

/*
 * ============================================================
 * FAMILY TREE
 * ============================================================
 */

function FamilyTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const [hoveredMemberId, setHoveredMemberId] = useState(null);

  /*
   * ==========================================================
   * ACTIVE MEMBER
   * ==========================================================
   */

  const activeMemberId =
    selectedMemberId !== null ? selectedMemberId : hoveredMemberId;

  /*
   * ==========================================================
   * HIGHLIGHTED RELATIONSHIPS
   * ==========================================================
   */

  const highlightedData = useMemo(() => {
    if (activeMemberId === null) {
      return {
        nodeIds: new Set(),
        edgeIds: new Set(),
      };
    }

    const activeId = activeMemberId.toString();

    const nodeIds = new Set([activeId]);

    const edgeIds = new Set();

    edges.forEach((edge) => {
      if (edge.source === activeId || edge.target === activeId) {
        edgeIds.add(edge.id);

        nodeIds.add(edge.source);

        nodeIds.add(edge.target);
      }
    });

    return {
      nodeIds,
      edgeIds,
    };
  }, [activeMemberId, edges]);

  /*
   * ==========================================================
   * DISPLAY NODES
   * ==========================================================
   */

  const displayNodes = useMemo(() => {
    if (activeMemberId === null) {
      return nodes.map((node) => ({
        ...node,

        className:
          node.className
            ?.replace(" family-node-highlighted", "")
            .replace(" family-node-dimmed", "") || undefined,
      }));
    }

    return nodes.map((node) => {
      /*
       * Keep family root visible.
       */

      if (node.id.startsWith("family-")) {
        return {
          ...node,

          className: `${node.className || ""} family-root-highlight-safe`,
        };
      }

      const connected = highlightedData.nodeIds.has(node.id);

      const active = node.id === activeMemberId.toString();

      return {
        ...node,

        className: [
          node.className || "",

          active ? "family-node-highlighted" : "",

          !connected ? "family-node-dimmed" : "",
        ]
          .filter(Boolean)
          .join(" "),
      };
    });
  }, [nodes, activeMemberId, highlightedData.nodeIds]);

  /*
   * ==========================================================
   * DISPLAY EDGES
   * ==========================================================
   */

  const displayEdges = useMemo(() => {
    if (activeMemberId === null) {
      return edges.map((edge) => ({
        ...edge,

        className:
          edge.className
            ?.replace(" relationship-edge-active", "")
            .replace(" relationship-edge-dimmed", "") || undefined,
      }));
    }

    return edges.map((edge) => {
      const active = highlightedData.edgeIds.has(edge.id);

      return {
        ...edge,

        className: [
          edge.className || "",

          active ? "relationship-edge-active" : "relationship-edge-dimmed",
        ]
          .filter(Boolean)
          .join(" "),
      };
    });
  }, [edges, activeMemberId, highlightedData.edgeIds]);

  /*
   * ==========================================================
   * LOAD TREE
   * ==========================================================
   */

  useEffect(() => {
    fetchTreeData();
  }, []);

  /*
   * ==========================================================
   * FETCH TREE DATA
   * ==========================================================
   */

  const fetchTreeData = async () => {
    try {
      /*
       * --------------------------------------------------------
       * FAMILY
       * --------------------------------------------------------
       */

      const familyResponse = await api.get("/api/families/current");

      /*
       * --------------------------------------------------------
       * MEMBERS
       * --------------------------------------------------------
       */

      const membersResponse = await api.get("/api/members");

      /*
       * --------------------------------------------------------
       * RELATIONSHIPS
       * --------------------------------------------------------
       */

      const relationshipsResponse = await api.get("/api/relationships");

      const family = familyResponse.data;

      const members = membersResponse.data;

      const relationships = relationshipsResponse.data;

      console.log("Family:", family);

      console.log("Members:", members);

      console.log("Relationships:", relationships);

      /*
       * ========================================================
       * PARENT RELATIONSHIPS
       *
       * Only these determine generation.
       * ========================================================
       */

      const parentRelations = [];

      const parentChildKeys = new Set();

      relationships.forEach((relationship) => {
        const type = relationship.relationshipType;

        if (isParentRelationship(type)) {
          if (!relationship.memberOne || !relationship.memberTwo) {
            return;
          }

          const parentId = Number(relationship.memberOne.id);

          const childId = Number(relationship.memberTwo.id);

          const key = `${parentId}-${childId}`;

          if (!parentChildKeys.has(key)) {
            parentChildKeys.add(key);

            parentRelations.push({
              parentId,
              childId,
              type,
            });
          }
        }

        /*
         * Son / Daughter:
         *
         * memberOne = child
         * memberTwo = parent
         *
         * Therefore reverse it.
         */

        if (isChildRelationship(type)) {
          if (!relationship.memberOne || !relationship.memberTwo) {
            return;
          }

          const parentId = Number(relationship.memberTwo.id);

          const childId = Number(relationship.memberOne.id);

          const key = `${parentId}-${childId}`;

          if (!parentChildKeys.has(key)) {
            parentChildKeys.add(key);

            parentRelations.push({
              parentId,
              childId,
              type,
            });
          }
        }
      });

      /*
       * ========================================================
       * SPOUSE PAIRS
       * ========================================================
       */

      const spousePairs = [];

      const spouseKeys = new Set();

      relationships.forEach((relationship) => {
        if (!isSpouseRelationship(relationship.relationshipType)) {
          return;
        }

        if (!relationship.memberOne || !relationship.memberTwo) {
          return;
        }

        const id1 = Number(relationship.memberOne.id);

        const id2 = Number(relationship.memberTwo.id);

        if (id1 === id2) {
          return;
        }

        const smaller = Math.min(id1, id2);

        const larger = Math.max(id1, id2);

        const key = `${smaller}-${larger}`;

        if (!spouseKeys.has(key)) {
          spouseKeys.add(key);

          spousePairs.push({
            memberOneId: id1,

            memberTwoId: id2,
          });
        }
      });

      /*
       * ========================================================
       * GENERATIONS
       * ========================================================
       */

      const generationMap = {};

      members.forEach((member) => {
        generationMap[Number(member.id)] = null;
      });

      const childrenIds = new Set(
        parentRelations.map((relation) => relation.childId),
      );

      /*
       * Members with no parent relationship
       * begin at generation 0.
       */

      members.forEach((member) => {
        const id = Number(member.id);

        if (!childrenIds.has(id)) {
          generationMap[id] = 0;
        }
      });

      /*
       * --------------------------------------------------------
       * Recursive generation
       * --------------------------------------------------------
       */

      const calculateGeneration = (memberId, visiting = new Set()) => {
        memberId = Number(memberId);

        if (
          generationMap[memberId] !== null &&
          generationMap[memberId] !== undefined
        ) {
          return generationMap[memberId];
        }

        if (visiting.has(memberId)) {
          return 0;
        }

        visiting.add(memberId);

        const parents = parentRelations.filter(
          (relation) => relation.childId === memberId,
        );

        if (parents.length === 0) {
          generationMap[memberId] = 0;

          return 0;
        }

        let highest = 0;

        parents.forEach((relation) => {
          const parentGeneration = calculateGeneration(
            relation.parentId,
            new Set(visiting),
          );

          highest = Math.max(highest, parentGeneration);
        });

        generationMap[memberId] = highest + 1;

        return generationMap[memberId];
      };

      members.forEach((member) => {
        calculateGeneration(member.id);
      });

      /*
       * --------------------------------------------------------
       * SPOUSES SAME GENERATION
       * --------------------------------------------------------
       */

      let changed = true;

      let safety = 0;

      while (changed && safety < 100) {
        changed = false;

        safety++;

        spousePairs.forEach((pair) => {
          const id1 = Number(pair.memberOneId);

          const id2 = Number(pair.memberTwoId);

          const gen1 = generationMap[id1];

          const gen2 = generationMap[id2];

          if (
            gen1 === null ||
            gen2 === null ||
            gen1 === undefined ||
            gen2 === undefined
          ) {
            return;
          }

          const target = Math.max(gen1, gen2);

          if (gen1 !== target) {
            generationMap[id1] = target;

            changed = true;
          }

          if (gen2 !== target) {
            generationMap[id2] = target;

            changed = true;
          }
        });
      }

      /*
       * ========================================================
       * GENERATION GROUPS
       * ========================================================
       */

      const generationGroups = {};

      members.forEach((member) => {
        const generation = generationMap[Number(member.id)] ?? 0;

        if (!generationGroups[generation]) {
          generationGroups[generation] = [];
        }

        generationGroups[generation].push(member);
      });

      /*
       * ========================================================
       * NODES
       * ========================================================
       */

      const generatedNodes = [];

      /*
       * FAMILY ROOT
       */

      generatedNodes.push({
        id: `family-${family.id}`,

        type: "default",

        position: {
          x: 0,
          y: 0,
        },

        data: {
          label: `🌳 ${family.name}`,
        },

        className: "cinematic-family-root",

        style: {
          width: ROOT_WIDTH,

          padding: "18px 22px",

          borderRadius: "22px",

          border: "1px solid rgba(255,255,255,0.9)",

          background:
            "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(238,244,226,0.94))",

          color: "#3c5034",

          fontWeight: "800",

          fontSize: "18px",

          textAlign: "center",

          boxShadow: "0 20px 55px rgba(55,75,45,0.16)",

          backdropFilter: "blur(16px)",
        },

        draggable: false,
      });

      /*
       * MEMBER NODES
       */

      Object.keys(generationGroups)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((generation) => {
          const group = generationGroups[generation];

          const processed = new Set();

          const units = [];

          /*
           * Group spouses together.
           */

          group.forEach((member) => {
            const memberId = Number(member.id);

            if (processed.has(memberId)) {
              return;
            }

            const spousePair = spousePairs.find(
              (pair) =>
                Number(pair.memberOneId) === memberId ||
                Number(pair.memberTwoId) === memberId,
            );

            if (spousePair) {
              const spouseId =
                Number(spousePair.memberOneId) === memberId
                  ? Number(spousePair.memberTwoId)
                  : Number(spousePair.memberOneId);

              const spouse = group.find((item) => Number(item.id) === spouseId);

              if (spouse) {
                units.push({
                  members: [member, spouse],
                });

                processed.add(memberId);

                processed.add(spouseId);

                return;
              }
            }

            units.push({
              members: [member],
            });

            processed.add(memberId);
          });

          /*
           * Calculate width.
           */

          let totalWidth = 0;

          units.forEach((unit) => {
            totalWidth += unit.members.length * NODE_WIDTH;

            totalWidth += (unit.members.length - 1) * 35;

            totalWidth += HORIZONTAL_GAP;
          });

          let currentX = -totalWidth / 2;

          units.forEach((unit) => {
            unit.members.forEach((member) => {
              const memberId = Number(member.id);

              const hasSavedPosition =
                member.positionX !== null &&
                member.positionX !== undefined &&
                member.positionY !== null &&
                member.positionY !== undefined;

              const defaultX = currentX;

              const defaultY =
                180 + Number(generation) * (NODE_HEIGHT + GENERATION_GAP);

              generatedNodes.push({
                id: memberId.toString(),

                type: "familyNode",

                position: {
                  x: hasSavedPosition ? Number(member.positionX) : defaultX,

                  y: hasSavedPosition ? Number(member.positionY) : defaultY,
                },

                data: {
                  id: member.id,

                  label: member.fullName,

                  occupation: member.occupation,

                  imagePath: member.imagePath,

                  biography: member.biography,

                  gender: member.gender,

                  dateOfBirth: member.dateOfBirth,
                },

                draggable: true,
              });

              currentX += NODE_WIDTH + HORIZONTAL_GAP;
            });
          });
        });

      /*
       * ========================================================
       * EDGES
       * ========================================================
       */

      const generatedEdges = [];

      const edgeKeys = new Set();

      /*
       * ========================================================
       * FAMILY ROOT CONNECTION
       *
       * Only ONE spouse receives the root connection.
       * ========================================================
       */

      const rootGeneration = generationGroups[0] || [];

      const rootProcessed = new Set();

      rootGeneration.forEach((member) => {
        const memberId = Number(member.id);

        if (rootProcessed.has(memberId)) {
          return;
        }

        const spousePair = spousePairs.find(
          (pair) =>
            Number(pair.memberOneId) === memberId ||
            Number(pair.memberTwoId) === memberId,
        );

        let targetId = memberId;

        if (spousePair) {
          const spouseId =
            Number(spousePair.memberOneId) === memberId
              ? Number(spousePair.memberTwoId)
              : Number(spousePair.memberOneId);

          targetId = Math.min(memberId, spouseId);

          rootProcessed.add(spouseId);
        }

        rootProcessed.add(memberId);

        const key = `family-${family.id}-${targetId}`;

        if (edgeKeys.has(key)) {
          return;
        }

        edgeKeys.add(key);

        generatedEdges.push({
          id: key,

          source: `family-${family.id}`,

          target: targetId.toString(),

          type: "smoothstep",

          className: "family-root-edge",

          style: {
            stroke: "rgba(105,128,76,0.75)",

            strokeWidth: 2.5,

            strokeDasharray: "6 5",
          },
        });
      });

      /*
       * ========================================================
       * ALL RELATIONSHIP EDGES
       * ========================================================
       */

      relationships.forEach((relationship) => {
        if (!relationship.memberOne || !relationship.memberTwo) {
          return;
        }

        const type = relationship.relationshipType || "Other";

        /*
         * ----------------------------------------------------
         * SOURCE / TARGET
         * ----------------------------------------------------
         */

        let sourceId = Number(relationship.memberOne.id);

        let targetId = Number(relationship.memberTwo.id);

        /*
         * Son / Daughter are stored in the
         * reverse semantic direction.
         *
         * Convert:
         *
         * Son → Parent
         *
         * into:
         *
         * Parent → Son
         */

        if (isChildRelationship(type)) {
          sourceId = Number(relationship.memberTwo.id);

          targetId = Number(relationship.memberOne.id);
        }

        /*
         * ----------------------------------------------------
         * DUPLICATE KEY
         * ----------------------------------------------------
         */

        const key = `relationship-${relationship.id}`;

        if (edgeKeys.has(key)) {
          return;
        }

        edgeKeys.add(key);

        /*
         * ----------------------------------------------------
         * VISUAL CONFIG
         * ----------------------------------------------------
         */

        const visual = relationshipVisuals[type] || relationshipVisuals.Other;

        /*
         * ----------------------------------------------------
         * EDGE
         * ----------------------------------------------------
         */

        generatedEdges.push({
          id: key,

          source: sourceId.toString(),

          target: targetId.toString(),

          label: type,

          type: "smoothstep",

          animated: true,

          className: `${visual.className} relationship-edge`,

          style: {
            stroke: visual.color,

            strokeWidth: isSpouseRelationship(type) ? 3 : 2.5,

            strokeDasharray: isSpouseRelationship(type) ? "8 5" : "10 6",

            strokeLinecap: "round",
          },

          labelStyle: {
            fill: visual.labelColor,

            fontWeight: "800",

            fontSize: 10,
          },

          labelBgStyle: {
            fill: visual.background,

            fillOpacity: 0.96,
          },

          markerEnd: isSpouseRelationship(type)
            ? undefined
            : {
                type: MarkerType.ArrowClosed,

                color: visual.color,

                width: 16,

                height: 16,
              },
        });
      });

      /*
       * ========================================================
       * UPDATE TREE
       * ========================================================
       */

      setNodes(generatedNodes);

      setEdges(generatedEdges);
    } catch (error) {
      console.log("Unable to load family tree:", error);
    }
  };

  /*
   * ==========================================================
   * HOVER
   * ==========================================================
   */

  const onNodeMouseEnter = (event, node) => {
    if (node.id.startsWith("family-")) {
      return;
    }

    setHoveredMemberId(Number(node.id));
  };

  const onNodeMouseLeave = () => {
    setHoveredMemberId(null);
  };

  /*
   * ==========================================================
   * CLICK MEMBER
   * ==========================================================
   */

  const onNodeClick = (event, node) => {
    if (node.id.startsWith("family-")) {
      return;
    }

    const id = Number(node.id);

    setSelectedMemberId((current) => (current === id ? null : id));
  };

  /*
   * ==========================================================
   * CLICK CANVAS
   * ==========================================================
   */

  const onPaneClick = () => {
    setSelectedMemberId(null);

    setHoveredMemberId(null);
  };

  /*
   * ==========================================================
   * DRAG SAVE
   * ==========================================================
   */

  const onNodeDragStop = async (event, node) => {
    if (node.id.startsWith("family-")) {
      return;
    }

    /*
     * Update local position immediately.
     */

    setNodes((currentNodes) =>
      currentNodes.map((item) =>
        item.id === node.id
          ? {
              ...item,

              position: {
                x: node.position.x,

                y: node.position.y,
              },
            }
          : item,
      ),
    );

    /*
     * Persist position.
     */

    try {
      await api.put(`/api/members/${node.id}/position`, {
        positionX: node.position.x,

        positionY: node.position.y,
      });

      console.log("Position saved:", node.id, node.position);
    } catch (error) {
      console.log("Unable to save position:", error);
    }
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="family-tree-page">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="family-tree-heading">
        <div className="family-tree-heading-icon">🌳</div>

        <div>
          <span className="family-tree-eyebrow">YOUR FAMILY STORY</span>

          <h1>Family Tree</h1>

          <p>
            Explore the people, relationships and generations that connect your
            family.
          </p>
        </div>
      </div>

      {/* ======================================================
          TREE SCENE
          ====================================================== */}

      <div
        className={`family-tree-scene ${
          activeMemberId !== null ? "tree-has-active-member" : ""
        }`}
      >
        {/* Atmospheric glows */}

        <div className="tree-scene-glow tree-glow-one"></div>

        <div className="tree-scene-glow tree-glow-two"></div>

        <div className="tree-scene-glow tree-glow-three"></div>

        {/* Floating particles */}

        <div className="tree-particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* ====================================================
            REACT FLOW
            ==================================================== */}

        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          onNodeDragStop={onNodeDragStop}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{
            padding: 0.25,

            minZoom: 0.45,

            maxZoom: 1.15,
          }}
        >
          <Background color="rgba(113,135,82,0.16)" gap={32} size={1} />

          <Controls
            showInteractive={false}
            className="cinematic-tree-controls"
          />

          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith("family-")) {
                return "#789456";
              }

              if (
                activeMemberId !== null &&
                highlightedData.nodeIds.has(node.id)
              ) {
                return "#8fa96b";
              }

              return "#c5d0b5";
            }}
            maskColor="rgba(226,232,216,0.65)"
            className="cinematic-tree-minimap"
            pannable={true}
            zoomable={true}
          />
        </ReactFlow>

        {/* ====================================================
            ACTIVE RELATIONSHIP INDICATOR
            ==================================================== */}

        {activeMemberId !== null && (
          <div className="tree-active-indicator">
            <span className="active-indicator-star">✦</span>

            <span>Family connections highlighted</span>

            <button
              onClick={() => {
                setSelectedMemberId(null);

                setHoveredMemberId(null);
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* ====================================================
            NORMAL INSTRUCTION
            ==================================================== */}

        {activeMemberId === null && (
          <div className="tree-scene-label">
            <span className="scene-label-icon">✦</span>

            <span>Hover over a member to explore their family connections</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FamilyTree;
