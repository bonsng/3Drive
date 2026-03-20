import * as THREE from "three";
import type { Node } from "@/lib/sample-tree";

export interface PositionedNode extends Node {
  position: [number, number, number];
  depth: number;
  parentPosition?: [number, number, number];
}

export function assignPositions(
  tree: Node,
  baseRadius = 0.9,
  radiusStep = 0.9,
): Map<number, PositionedNode> {
  const nodeMap = new Map<number, PositionedNode>();

  function traverse(
    node: Node,
    depth: number,
    _thetaRange: [number, number],
    _phiRange: [number, number],
    parentPosition?: [number, number, number],
    grandParentPosition?: [number, number, number],
    childIndex?: number,
    siblingCount?: number,
  ) {
    let position: [number, number, number];

    if (depth === 0) {
      position = [0, 0, 0];
    } else if (depth === 1) {
      if (childIndex === undefined || siblingCount === undefined)
        throw new Error("Missing child indexing for spherical layout");

      const radius = baseRadius;

      // Distribute evenly on sphere using golden section spiral
      const increment = Math.PI * (3 - Math.sqrt(5));
      const offset = 2 / siblingCount;
      const y = 1 - childIndex * offset - offset / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = childIndex * increment;

      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      position = [x * radius, y * radius, z * radius];
    } else {
      if (!parentPosition || !grandParentPosition)
        throw new Error("Missing position data");
      if (childIndex === undefined || siblingCount === undefined)
        throw new Error("Missing child indexing for ring layout");

      const parentVec = new THREE.Vector3(...parentPosition);
      const grandVec = new THREE.Vector3(...grandParentPosition);
      const dir = parentVec
        .clone()
        .sub(grandVec)
        .normalize()
        .multiplyScalar(radiusStep);
      const center = parentVec.clone().add(dir);

      // compute even angle spacing on ring
      const angle = (childIndex / siblingCount) * 2 * Math.PI;
      const r = siblingCount > 20 ? 0.8 : 0.4;
      const up = new THREE.Vector3(0, 1, 0);
      if (Math.abs(dir.dot(up)) > 0.9) up.set(1, 0, 0);
      const tangent1 = new THREE.Vector3().crossVectors(dir, up).normalize();
      const tangent2 = new THREE.Vector3()
        .crossVectors(dir, tangent1)
        .normalize();

      const offset = tangent1
        .multiplyScalar(Math.cos(angle) * r)
        .add(tangent2.multiplyScalar(Math.sin(angle) * r));
      const final = center.clone().add(offset);
      position = [final.x, final.y, final.z];
    }

    const positionedNode: PositionedNode = {
      ...node,
      position,
      depth,
      parentPosition,
    };

    nodeMap.set(node.id, positionedNode);

    node.children?.forEach((child, index) => {
      traverse(
        child,
        depth + 1,
        [0, 0],
        [0, 0],
        position,
        parentPosition,
        index,
        node.children!.length,
      );
    });
  }

  traverse(tree, 0, [0, Math.PI], [0, 2 * Math.PI]);
  return nodeMap;
}
