import React, { useEffect, useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

import api from "../services/api";

import FamilyNode from "./FamilyNode";

/*
 * ============================================================
 * NODE TYPES
 * ============================================================
 */

const nodeTypes = {
  familyNode: FamilyNode,
};

/*
 * ============================================================
 * TREE CONFIGURATION
 * ============================================================
 */

const NODE_WIDTH = 240;
const NODE_HEIGHT = 340;

const SPOUSE_GAP = 35;

/*
 * Gap between different family branches.
 */
const FAMILY_GAP = 180;

/*
 * Vertical distance between generations.
 */
const GENERATION_GAP = 180;

/*
 * Width of the family root node.
 */
const FAMILY_ROOT_WIDTH = 280;

/*
 * Invisible junction node.
 */
const JUNCTION_SIZE = 4;

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const numberId = (value) => Number(value);

const normalizeId = (value) => String(Number(value));

/*
 * ============================================================
 * FAMILY TREE
 * ============================================================
 */

function FamilyTree({ onReactFlowInit }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [loading, setLoading] = useState(true);

  // The React Flow surface follows the complete tree dimensions.
  const [treeSize, setTreeSize] = useState({ width: 1200, height: 900 });

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
   * FETCH DATA
   * ==========================================================
   */

  const fetchTreeData = async () => {
    try {
      setLoading(true);

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

      const members = membersResponse.data || [];

      const relationships = relationshipsResponse.data || [];

      console.log("Family:", family);
      console.log("Members:", members);
      console.log("Relationships:", relationships);

      /*
       * ========================================================
       * MEMBER MAP
       * ========================================================
       */

      const memberMap = {};

      members.forEach((member) => {
        memberMap[numberId(member.id)] = member;
      });

      /*
       * ========================================================
       * NORMALIZE RELATIONSHIPS
       * ========================================================
       *
       * We convert every parent/child relationship into:
       *
       * parentId
       * childId
       *
       * Therefore both of these work:
       *
       * Father → Son
       *
       * Son → Father
       *
       * ========================================================
       */

      const parentRelations = [];

      const spouseRelations = [];

      const parentChildKeys = new Set();

      const spouseKeys = new Set();

      relationships.forEach((relationship) => {
        if (!relationship.memberOne || !relationship.memberTwo) {
          return;
        }

        const memberOneId = numberId(relationship.memberOne.id);

        const memberTwoId = numberId(relationship.memberTwo.id);

        const type = String(relationship.relationshipType || "").trim();

        /*
         * ------------------------------------------------------
         * PARENT → CHILD
         * ------------------------------------------------------
         */

        if (type === "Father" || type === "Mother" || type === "Parent") {
          const parentId = memberOneId;

          const childId = memberTwoId;

          const key = `${parentId}-${childId}`;

          if (!parentChildKeys.has(key)) {
            parentChildKeys.add(key);

            parentRelations.push({
              parentId,
              childId,
              type,
            });
          }

          return;
        }

        /*
         * ------------------------------------------------------
         * CHILD → PARENT
         * ------------------------------------------------------
         *
         * Example:
         *
         * Subramani → Son → Muniyappa
         *
         * becomes:
         *
         * Muniyappa → Subramani
         * ------------------------------------------------------
         */

        if (type === "Son" || type === "Daughter") {
          const parentId = memberTwoId;

          const childId = memberOneId;

          const key = `${parentId}-${childId}`;

          if (!parentChildKeys.has(key)) {
            parentChildKeys.add(key);

            parentRelations.push({
              parentId,
              childId,
              type,
            });
          }

          return;
        }

        /*
         * ------------------------------------------------------
         * SPOUSE
         * ------------------------------------------------------
         */

        if (type === "Husband" || type === "Wife" || type === "Spouse") {
          if (memberOneId === memberTwoId) {
            return;
          }

          const smaller = Math.min(memberOneId, memberTwoId);

          const larger = Math.max(memberOneId, memberTwoId);

          const key = `${smaller}-${larger}`;

          if (!spouseKeys.has(key)) {
            spouseKeys.add(key);

            spouseRelations.push({
              memberOneId,
              memberTwoId,
            });
          }
        }
      });

      console.log("Normalized Parent Relations:", parentRelations);

      console.log("Normalized Spouse Relations:", spouseRelations);

      /*
       * ========================================================
       * SPOUSE MAP
       * ========================================================
       */

      const spouseMap = {};

      spouseRelations.forEach((pair) => {
        const id1 = numberId(pair.memberOneId);

        const id2 = numberId(pair.memberTwoId);

        spouseMap[id1] = id2;

        spouseMap[id2] = id1;
      });

      /*
       * ========================================================
       * PARENT MAP
       * ========================================================
       *
       * childId → [parentId, parentId]
       *
       * Example:
       *
       * Subramani → [Muniyappa, Lakshmamma]
       *
       * ========================================================
       */

      const parentsByChild = {};

      parentRelations.forEach((relation) => {
        const childId = numberId(relation.childId);

        const parentId = numberId(relation.parentId);

        if (!parentsByChild[childId]) {
          parentsByChild[childId] = [];
        }

        if (!parentsByChild[childId].includes(parentId)) {
          parentsByChild[childId].push(parentId);
        }
      });

      /*
       * ========================================================
       * CHILDREN MAP
       * ========================================================
       *
       * parentId → [childId, childId]
       *
       * ========================================================
       */

      const childrenByParent = {};

      parentRelations.forEach((relation) => {
        const parentId = numberId(relation.parentId);

        const childId = numberId(relation.childId);

        if (!childrenByParent[parentId]) {
          childrenByParent[parentId] = [];
        }

        if (!childrenByParent[parentId].includes(childId)) {
          childrenByParent[parentId].push(childId);
        }
      });

      /*
       * ========================================================
       * BUILD FAMILY UNITS
       * ========================================================
       *
       * A family unit is:
       *
       * Husband + Wife
       *
       * OR
       *
       * Single member
       *
       * ========================================================
       */

      const familyUnitByMember = {};

      const familyUnits = [];

      const processedMembers = new Set();

      members.forEach((member) => {
        const id = numberId(member.id);

        if (processedMembers.has(id)) {
          return;
        }

        const spouseId = spouseMap[id];

        /*
         * Couple
         */

        if (
          spouseId &&
          memberMap[spouseId] &&
          !processedMembers.has(spouseId)
        ) {
          const spouse = memberMap[spouseId];

          const ids = [id, numberId(spouse.id)].sort((a, b) => a - b);

          const unit = {
            id: `family-unit-${ids[0]}-${ids[1]}`,

            memberIds: ids,

            members: [memberMap[ids[0]], memberMap[ids[1]]],

            children: [],

            parentUnitIds: [],

            childUnitIds: [],
          };

          familyUnits.push(unit);

          familyUnitByMember[id] = unit;

          familyUnitByMember[spouseId] = unit;

          processedMembers.add(id);

          processedMembers.add(spouseId);

          return;
        }

        /*
         * Single member
         */

        const unit = {
          id: `family-unit-${id}`,

          memberIds: [id],

          members: [member],

          children: [],

          parentUnitIds: [],

          childUnitIds: [],
        };

        familyUnits.push(unit);

        familyUnitByMember[id] = unit;

        processedMembers.add(id);
      });

      /*
       * ========================================================
       * CONNECT FAMILY UNITS
       * ========================================================
       *
       * Every child belongs to the family unit containing
       * their parent(s).
       *
       * This is the important part that fixes the current
       * "everything is connected to everything" appearance.
       * ========================================================
       */

      const childUnitSeen = new Set();

      parentRelations.forEach((relation) => {
        const parentId = numberId(relation.parentId);

        const childId = numberId(relation.childId);

        const parentUnit = familyUnitByMember[parentId];

        const childUnit = familyUnitByMember[childId];

        if (!parentUnit || !childUnit) {
          return;
        }

        /*
         * Don't allow a unit to become its own parent.
         */

        if (parentUnit.id === childUnit.id) {
          return;
        }

        /*
         * Add child to parent unit.
         */

        if (!parentUnit.children.includes(childId)) {
          parentUnit.children.push(childId);
        }

        /*
         * Parent unit → child unit.
         */

        const connectionKey = `${parentUnit.id}->${childUnit.id}`;

        if (!childUnitSeen.has(connectionKey)) {
          childUnitSeen.add(connectionKey);

          if (!parentUnit.childUnitIds.includes(childUnit.id)) {
            parentUnit.childUnitIds.push(childUnit.id);
          }

          if (!childUnit.parentUnitIds.includes(parentUnit.id)) {
            childUnit.parentUnitIds.push(parentUnit.id);
          }
        }
      });

      console.log("Family Units:", familyUnits);

      /*
       * ========================================================
       * FIND ROOT FAMILY UNITS
       * ========================================================
       *
       * A root unit has no parents.
       * ========================================================
       */

      let rootUnits = familyUnits.filter(
        (unit) => unit.parentUnitIds.length === 0,
      );

      /*
       * Safety fallback.
       */

      if (rootUnits.length === 0) {
        rootUnits = familyUnits.slice(0, 1);
      }

      /*
       * ========================================================
       * BUILD DESCENDANT WIDTH
       * ========================================================
       *
       * This calculates how much horizontal space each family
       * branch needs.
       *
       * Example:
       *
       *                 Father ─ Mother
       *                       |
       *              ┌────────┴────────┐
       *              │                 │
       *            Son               Daughter
       *             |
       *          Wife
       *             |
       *          Children
       *
       * The parent's branch receives enough width for all of
       * its children instead of simply putting everyone into
       * one generation row.
       * ========================================================
       */

      const unitWidthCache = new Map();

      const calculatingUnits = new Set();

      const getOwnUnitWidth = (unit) => {
        if (unit.members.length === 2) {
          return NODE_WIDTH * 2 + SPOUSE_GAP;
        }

        return NODE_WIDTH;
      };

      const getUnitWidth = (unit) => {
        if (unitWidthCache.has(unit.id)) {
          return unitWidthCache.get(unit.id);
        }

        /*
         * Protect against accidental circular relationship
         * data.
         */

        if (calculatingUnits.has(unit.id)) {
          return getOwnUnitWidth(unit);
        }

        calculatingUnits.add(unit.id);

        const ownWidth = getOwnUnitWidth(unit);

        /*
         * No children.
         */

        if (!unit.childUnitIds || unit.childUnitIds.length === 0) {
          calculatingUnits.delete(unit.id);

          unitWidthCache.set(unit.id, ownWidth);

          return ownWidth;
        }

        /*
         * Calculate children's required width.
         */

        let childrenWidth = 0;

        unit.childUnitIds.forEach((childUnitId) => {
          const childUnit = familyUnits.find((item) => item.id === childUnitId);

          if (!childUnit) {
            return;
          }

          childrenWidth += getUnitWidth(childUnit);
        });

        /*
         * Add gaps between child branches.
         */

        childrenWidth += Math.max(0, unit.childUnitIds.length - 1) * FAMILY_GAP;

        const finalWidth = Math.max(ownWidth, childrenWidth);

        calculatingUnits.delete(unit.id);

        unitWidthCache.set(unit.id, finalWidth);

        return finalWidth;
      };

      /*
       * Calculate widths for every unit.
       */

      familyUnits.forEach((unit) => {
        getUnitWidth(unit);
      });

      /*
       * ========================================================
       * GENERATION MAP
       * ========================================================
       *
       * This is still useful for vertical positioning.
       * ========================================================
       */

      const generationMap = {};

      familyUnits.forEach((unit) => {
        generationMap[unit.id] = null;
      });

      const calculateUnitGeneration = (unit, visiting = new Set()) => {
        if (
          generationMap[unit.id] !== null &&
          generationMap[unit.id] !== undefined
        ) {
          return generationMap[unit.id];
        }

        if (visiting.has(unit.id)) {
          return 0;
        }

        visiting.add(unit.id);

        if (!unit.parentUnitIds || unit.parentUnitIds.length === 0) {
          generationMap[unit.id] = 0;

          return 0;
        }

        let generation = 0;

        unit.parentUnitIds.forEach((parentUnitId) => {
          const parentUnit = familyUnits.find(
            (item) => item.id === parentUnitId,
          );

          if (!parentUnit) {
            return;
          }

          generation = Math.max(
            generation,
            calculateUnitGeneration(parentUnit, new Set(visiting)) + 1,
          );
        });

        generationMap[unit.id] = generation;

        return generation;
      };

      familyUnits.forEach((unit) => {
        calculateUnitGeneration(unit);
      });

      /*
       * ========================================================
       * GENERATE NODES
       * ========================================================
       */

      const generatedNodes = [];

      /*
       * --------------------------------------------------------
       * FAMILY ROOT
       * --------------------------------------------------------
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

        draggable: false,

        selectable: false,

        style: {
          width: FAMILY_ROOT_WIDTH,

          padding: "16px 22px",

          borderRadius: "18px",

          border: "1px solid #d7e2d2",

          background: "linear-gradient(135deg, #ffffff, #f5f9f1)",

          color: "#263528",

          fontWeight: "700",

          fontSize: "20px",

          textAlign: "center",

          boxShadow: "0 8px 24px rgba(62, 88, 60, 0.10)",
        },
      });

      /*
       * ========================================================
       * POSITION FAMILY UNITS RECURSIVELY
       * ========================================================
       */

      const positionedUnits = new Set();

      const positionFamilyUnit = (unit, centerX) => {
        if (positionedUnits.has(unit.id)) {
          return;
        }

        positionedUnits.add(unit.id);

        const generation = generationMap[unit.id] ?? 0;

        const y = 150 + generation * (NODE_HEIGHT + GENERATION_GAP);

        const branchWidth = getUnitWidth(unit);

        /*
         * ------------------------------------------------------
         * POSITION MEMBERS OF THE FAMILY UNIT
         * ------------------------------------------------------
         */

        const ownWidth = getOwnUnitWidth(unit);

        const ownStartX = centerX - ownWidth / 2;

        unit.members.forEach((member, index) => {
          const id = numberId(member.id);

          let x = ownStartX;

          if (unit.members.length === 2 && index === 1) {
            x += NODE_WIDTH + SPOUSE_GAP;
          }

          generatedNodes.push({
            id: normalizeId(id),

            type: "familyNode",

            position: {
              x,
              y,
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
        });

        /*
         * ------------------------------------------------------
         * POSITION CHILD FAMILY UNITS
         * ------------------------------------------------------
         *
         * Children are placed directly underneath this family
         * unit.
         * ------------------------------------------------------
         */

        if (!unit.childUnitIds || unit.childUnitIds.length === 0) {
          return;
        }

        /*
         * Calculate total child width.
         */

        let totalChildrenWidth = 0;

        unit.childUnitIds.forEach((childUnitId) => {
          const childUnit = familyUnits.find((item) => item.id === childUnitId);

          if (!childUnit) {
            return;
          }

          totalChildrenWidth += getUnitWidth(childUnit);
        });

        totalChildrenWidth +=
          Math.max(0, unit.childUnitIds.length - 1) * FAMILY_GAP;

        /*
         * Children are centered underneath the parents.
         */

        let childStartX = centerX - totalChildrenWidth / 2;

        unit.childUnitIds.forEach((childUnitId) => {
          const childUnit = familyUnits.find((item) => item.id === childUnitId);

          if (!childUnit) {
            return;
          }

          const childWidth = getUnitWidth(childUnit);

          const childCenter = childStartX + childWidth / 2;

          positionFamilyUnit(childUnit, childCenter);

          childStartX += childWidth + FAMILY_GAP;
        });
      };

      /*
       * ========================================================
       * POSITION ROOT BRANCHES
       * ========================================================
       */

      let rootTotalWidth = 0;

      rootUnits.forEach((unit) => {
        rootTotalWidth += getUnitWidth(unit);
      });

      rootTotalWidth += Math.max(0, rootUnits.length - 1) * FAMILY_GAP;

      let rootStartX = -rootTotalWidth / 2;

      rootUnits.forEach((unit) => {
        const unitWidth = getUnitWidth(unit);

        const centerX = rootStartX + unitWidth / 2;

        positionFamilyUnit(unit, centerX);

        rootStartX += unitWidth + FAMILY_GAP;
      });

      /*
       * ========================================================
       * HANDLE DISCONNECTED MEMBERS
       * ========================================================
       *
       * If a member has no relationship at all, they still need
       * to appear in the tree.
       * ========================================================
       */

      familyUnits.forEach((unit) => {
        if (positionedUnits.has(unit.id)) {
          return;
        }

        const generation = generationMap[unit.id] ?? 0;

        const y = 150 + generation * (NODE_HEIGHT + GENERATION_GAP);

        const width = getUnitWidth(unit);

        /*
         * Place disconnected units farther to the right.
         */

        const existingMemberNodes = generatedNodes.filter(
          (node) => node.type === "familyNode",
        );

        let xOffset = existingMemberNodes.length * (NODE_WIDTH + FAMILY_GAP);

        xOffset += 500;

        const centerX = xOffset + width / 2;

        positionFamilyUnit(unit, centerX);
      });

      /*
       * ========================================================
       * CREATE EDGES
       * ========================================================
       */

      const generatedEdges = [];

      const edgeKeys = new Set();

      /*
       * ========================================================
       * FAMILY ROOT → ROOT FAMILY UNIT
       * ========================================================
       */

      rootUnits.forEach((unit, index) => {
        if (!unit.members.length) {
          return;
        }

        const firstMember = unit.members[0];

        const key = `family-root-${family.id}-${index}`;

        if (edgeKeys.has(key)) {
          return;
        }

        edgeKeys.add(key);

        generatedEdges.push({
          id: key,

          source: `family-${family.id}`,

          target: normalizeId(firstMember.id),

          type: "smoothstep",

          style: {
            stroke: "#a7b59f",

            strokeWidth: 2,
          },

          markerEnd: {
            type: MarkerType.ArrowClosed,

            color: "#a7b59f",

            width: 12,

            height: 12,
          },
        });
      });

      /*
       * ========================================================
       * SPOUSE EDGES
       * ========================================================
       *
       * Husband ───────── Wife
       *
       * No arrow.
       * ========================================================
       */

      spouseRelations.forEach((pair) => {
        const id1 = numberId(pair.memberOneId);

        const id2 = numberId(pair.memberTwoId);

        const smaller = Math.min(id1, id2);

        const larger = Math.max(id1, id2);

        const key = `spouse-${smaller}-${larger}`;

        if (edgeKeys.has(key)) {
          return;
        }

        edgeKeys.add(key);

        generatedEdges.push({
          id: key,

          source: normalizeId(smaller),

          target: normalizeId(larger),

          type: "straight",

          style: {
            stroke: "#8a948d",

            strokeWidth: 3,
          },
        });
      });

      /*
       * ========================================================
       * PARENT → CHILD CONNECTIONS
       * ========================================================
       *
       * Example:
       *
       *        Father ─── Mother
       *               │
       *               ●
       *             ┌─┴─┐
       *             ↓   ↓
       *           Son Daughter
       *
       * This is generated per FAMILY UNIT rather than globally
       * by generation.
       * ========================================================
       */

      familyUnits.forEach((parentUnit) => {
        if (!parentUnit.childUnitIds || parentUnit.childUnitIds.length === 0) {
          return;
        }

        /*
         * Find parent nodes.
         */

        const parentNodes = parentUnit.memberIds
          .map((id) =>
            generatedNodes.find((node) => node.id === normalizeId(id)),
          )
          .filter(Boolean);

        if (!parentNodes.length) {
          return;
        }

        /*
         * Parent center.
         */

        const parentCenterX =
          parentNodes.reduce(
            (sum, node) => sum + node.position.x + NODE_WIDTH / 2,
            0,
          ) / parentNodes.length;

        /*
         * Parent bottom.
         */

        const parentBottomY = Math.max(
          ...parentNodes.map((node) => node.position.y + NODE_HEIGHT),
        );

        /*
         * Child nodes.
         */

        const childNodes = [];

        parentUnit.childUnitIds.forEach((childUnitId) => {
          const childUnit = familyUnits.find((unit) => unit.id === childUnitId);

          if (!childUnit) {
            return;
          }

          /*
           * Use the center of the child family unit.
           */

          const firstChild = generatedNodes.find(
            (node) => node.id === normalizeId(childUnit.memberIds[0]),
          );

          if (!firstChild) {
            return;
          }

          let childUnitWidth = getOwnUnitWidth(childUnit);

          /*
           * If the child has its own descendants,
           * its visual center is still based on the
           * family unit width.
           */

          childUnitWidth = Math.max(childUnitWidth, getUnitWidth(childUnit));

          const childCenterX = firstChild.position.x + childUnitWidth / 2;

          childNodes.push({
            childUnit,
            firstChild,
            childCenterX,
          });
        });

        if (!childNodes.length) {
          return;
        }

        /*
         * ------------------------------------------------------
         * FAMILY JUNCTION
         * ------------------------------------------------------
         */

        const junctionY = parentBottomY + GENERATION_GAP / 2;

        const junctionId = `junction-${parentUnit.id}`;

        /*
         * Invisible junction.
         */

        generatedNodes.push({
          id: junctionId,

          type: "default",

          position: {
            x: parentCenterX - JUNCTION_SIZE / 2,

            y: junctionY - JUNCTION_SIZE / 2,
          },

          data: {
            label: "",
          },

          draggable: false,

          selectable: false,

          connectable: false,

          style: {
            width: JUNCTION_SIZE,

            height: JUNCTION_SIZE,

            padding: 0,

            border: "none",

            background: "transparent",

            opacity: 0,
          },
        });

        /*
         * ------------------------------------------------------
         * PARENT → JUNCTION
         * ------------------------------------------------------
         */

        parentUnit.memberIds.forEach((parentId) => {
          const key = `parent-${parentId}-${junctionId}`;

          if (edgeKeys.has(key)) {
            return;
          }

          edgeKeys.add(key);

          generatedEdges.push({
            id: key,

            source: normalizeId(parentId),

            target: junctionId,

            type: "smoothstep",

            style: {
              stroke: "#9aa89a",

              strokeWidth: 2.5,
            },
          });
        });

        /*
         * ------------------------------------------------------
         * JUNCTION → CHILDREN
         * ------------------------------------------------------
         */

        childNodes.forEach(({ childUnit, firstChild, childCenterX }) => {
          const childId = firstChild.id;

          const key = `child-${parentUnit.id}-${childUnit.id}`;

          if (edgeKeys.has(key)) {
            return;
          }

          edgeKeys.add(key);

          generatedEdges.push({
            id: key,

            source: junctionId,

            target: childId,

            type: "smoothstep",

            style: {
              stroke: "#9aa89a",

              strokeWidth: 2.5,
            },

            markerEnd: {
              type: MarkerType.ArrowClosed,

              color: "#9aa89a",

              width: 12,

              height: 12,
            },
          });
        });
      });

      /*
       * ========================================================
       * SET TREE
       * ========================================================
       */

      /*
       * ========================================================
       * CALCULATE COMPLETE TREE BOUNDS
       * ========================================================
       */

      const TREE_PADDING = 120;

      const getNodeWidth = (node) => {
        if (node.id.startsWith("family-")) return FAMILY_ROOT_WIDTH;
        if (node.id.startsWith("junction-")) return JUNCTION_SIZE;
        return NODE_WIDTH;
      };

      const getNodeHeight = (node) => {
        if (node.id.startsWith("family-")) return 64;
        if (node.id.startsWith("junction-")) return JUNCTION_SIZE;
        return NODE_HEIGHT;
      };

      const boundsNodes = generatedNodes.filter(
        (node) => !node.id.startsWith("junction-"),
      );

      const nodesForBounds = boundsNodes.length ? boundsNodes : generatedNodes;

      const minX = Math.min(
        ...nodesForBounds.map((node) => Number(node.position?.x || 0)),
      );

      const minY = Math.min(
        ...nodesForBounds.map((node) => Number(node.position?.y || 0)),
      );

      const maxX = Math.max(
        ...nodesForBounds.map(
          (node) => Number(node.position?.x || 0) + getNodeWidth(node),
        ),
      );

      const maxY = Math.max(
        ...nodesForBounds.map(
          (node) => Number(node.position?.y || 0) + getNodeHeight(node),
        ),
      );

      // Normalize coordinates so the complete tree has safe padding on all sides.
      const shiftX = TREE_PADDING - minX;
      const shiftY = TREE_PADDING - minY;

      const normalizedNodes = generatedNodes.map((node) => ({
        ...node,
        position: {
          x: Number(node.position?.x || 0) + shiftX,
          y: Number(node.position?.y || 0) + shiftY,
        },
      }));

      const completeTreeWidth = Math.max(
        900,
        Math.ceil(maxX - minX + TREE_PADDING * 2),
      );

      const completeTreeHeight = Math.max(
        700,
        Math.ceil(maxY - minY + TREE_PADDING * 2),
      );

      console.log("Generated Nodes:", normalizedNodes);
      console.log("Generated Edges:", generatedEdges);
      console.log("Complete Tree Size:", {
        width: completeTreeWidth,
        height: completeTreeHeight,
      });

      setTreeSize({
        width: completeTreeWidth,
        height: completeTreeHeight,
      });

      setNodes(normalizedNodes);
      setEdges(generatedEdges);
    } catch (error) {
      console.error("Unable to load family tree:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * SAVE DRAGGED POSITION
   * ============================================================
   */

  const onNodeDragStop = async (event, node) => {
    /*
     * Don't save helper nodes.
     */

    if (node.id.startsWith("family-") || node.id.startsWith("junction-")) {
      return;
    }

    /*
     * Update UI immediately.
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
     * Save position to backend.
     */

    try {
      await api.put(`/api/members/${node.id}/position`, {
        positionX: node.position.x,

        positionY: node.position.y,
      });

      console.log(`Position saved for member ${node.id}`, node.position);
    } catch (error) {
      console.error("Unable to save member position:", error);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div
        style={{
          width: "100%",

          height: "900px",

          marginTop: "20px",

          borderRadius: "22px",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          flexDirection: "column",

          gap: "16px",

          background: "linear-gradient(135deg, #fbfdf9, #f3f7f1)",

          border: "1px solid #dfe8dc",

          color: "#52604f",
        }}
      >
        <div
          style={{
            fontSize: "52px",
          }}
        >
          🌳
        </div>

        <div
          style={{
            fontSize: "18px",

            fontWeight: "700",
          }}
        >
          Growing your family tree...
        </div>

        <div
          style={{
            fontSize: "14px",

            color: "#7a8577",
          }}
        >
          Connecting your family generations
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      className="family-tree-viewport"
      style={{
        width: "100%",
        maxWidth: "100%",
        marginTop: "20px",
        overflowX: "auto",
        overflowY: "auto",
        borderRadius: "22px",
        border: "1px solid rgba(120, 140, 115, 0.25)",
        background: "linear-gradient(135deg, #eef5ed 0%, #e7efe6 100%)",
        boxShadow: "0 15px 45px rgba(70, 90, 65, 0.10)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        className="family-tree-wrapper"
        data-tree-export="family-tree"
        style={{
          width: `${treeSize.width}px`,
          minWidth: `${treeSize.width}px`,
          height: `${treeSize.height}px`,
          minHeight: `${treeSize.height}px`,
          borderRadius: "22px",
          overflow: "hidden",
          border: "1px solid rgba(120, 140, 115, 0.25)",
          background: "linear-gradient(135deg, #fbfdf9 0%, #f4f8f2 100%)",
          boxShadow: "0 15px 45px rgba(70, 90, 65, 0.10)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={onReactFlowInit}
          nodesDraggable={true}
          onNodeDragStop={onNodeDragStop}
          fitView
          fitViewOptions={{
            padding: 0.08,

            minZoom: 0.18,

            maxZoom: 1.2,
          }}
          defaultEdgeOptions={{
            type: "smoothstep",

            style: {
              stroke: "#9aa89a",

              strokeWidth: 2,
            },
          }}
          proOptions={{
            hideAttribution: false,
          }}
        >
          <Background color="#d8e2d4" gap={28} size={1} />

          <Controls
            style={{
              borderRadius: "12px",

              overflow: "hidden",

              boxShadow: "0 5px 18px rgba(50,70,45,0.12)",
            }}
          />

          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith("family-")) {
                return "#a5b89c";
              }

              if (node.id.startsWith("junction-")) {
                return "transparent";
              }

              const gender = node.data?.gender;

              if (String(gender).toLowerCase() === "female") {
                return "#e8b8c7";
              }

              if (String(gender).toLowerCase() === "male") {
                return "#a9c9e8";
              }

              return "#cbd5c6";
            }}
            maskColor="rgba(240,245,238,0.72)"
            style={{
              borderRadius: "14px",

              overflow: "hidden",

              boxShadow: "0 5px 18px rgba(50,70,45,0.10)",
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default FamilyTree;
