import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import FamilyNode from "./FamilyNode";
import dagre from "dagre";
const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeTypes = {
  familyNode: FamilyNode,
};

function FamilyTree({ members }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const getLayoutedElements = (nodes, edges) => {
    dagreGraph.setGraph({
      rankdir: "TB",

      nodesep: 100,

      ranksep: 180,
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(
        node.id,

        {
          width: 220,
          height: 250,
        },
      );
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      node.position = {
        x: nodeWithPosition.x,

        y: nodeWithPosition.y,
      };
    });

    return {
      nodes,
      edges,
    };
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      const membersResponse = await axios.get(
        "http://localhost:8080/api/members",
      );

      const relationshipsResponse = await axios.get(
        "http://localhost:8080/api/relationships",
      );

      const members = membersResponse.data;
      const relationships = relationshipsResponse.data;

      const generatedNodes = [];

      const generationMap = {};
      const parentMap = {};

      members.forEach((member) => {
        generationMap[member.id] = 0;
      });

      relationships.forEach((relation) => {
        if (
          relation.relationshipType === "Father" ||
          relation.relationshipType === "Mother"
        ) {
          generationMap[relation.memberTwo.id] =
            generationMap[relation.memberOne.id] + 1;

          if (!parentMap[relation.memberOne.id]) {
            parentMap[relation.memberOne.id] = [];
          }

          parentMap[relation.memberOne.id].push(relation.memberTwo.id);
        }
      });

      const generationGroups = {};

      members.forEach((member) => {
        const level = generationMap[member.id];

        if (!generationGroups[level]) {
          generationGroups[level] = [];
        }

        generationGroups[level].push(member);
      });

      Object.keys(generationGroups).forEach((level) => {
        const group = generationGroups[level];

        group.forEach((member, index) => {
          let xPosition = index * 350;

          // spouse alignment
          relationships.forEach((relation) => {
            if (
              relation.relationshipType === "Husband" ||
              relation.relationshipType === "Wife"
            ) {
              if (relation.memberTwo.id === member.id) {
                xPosition += 180;
              }
            }
          });

          // child centering
          Object.keys(parentMap).forEach((parentId) => {
            const children = parentMap[parentId];

            children.forEach((childId, childIndex) => {
              if (childId === member.id) {
                xPosition = parseInt(parentId) * 220 + childIndex * 180;
              }
            });
          });

          generatedNodes.push({
            id: member.id.toString(),

            type: "familyNode",

            position: {
              x: member.positionX ?? xPosition,
              y: member.positionY ?? level * 260,
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
          });
        });
      });
      const generatedEdges = relationships.map((relation) => ({
        id: relation.id.toString(),

        source: relation.memberOne.id.toString(),

        target: relation.memberTwo.id.toString(),

        label: relation.relationshipType,

        animated: true,

        type: "smoothstep",

        style: {
          stroke: "#4CAF50",
          strokeWidth: 3,
        },

        labelStyle: {
          fill: "#333",
          fontWeight: "bold",
        },

        markerEnd: {
          type: "arrowclosed",
          color: "#4CAF50",
        },
      }));

      const layouted = getLayoutedElements(generatedNodes, generatedEdges);

      setNodes(layouted.nodes);

      setEdges(layouted.edges);
    } catch (error) {
      console.log(error);
    }
  };

  const onNodeDragStop = async (event, node) => {
    try {
      await axios.put(`http://localhost:8080/api/members/${node.id}/position`, {
        positionX: node.position.x,
        positionY: node.position.y,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      style={{
        width: "100%",
        height: "2000px",
        border: "2px solid gray",
        marginTop: "20px",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background />

        <Controls />

        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default FamilyTree;
