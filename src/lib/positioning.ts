import * as THREE from 'three';
import type { Node, PositionedNode } from '@/types/node';
import type { Vec3, TraverseContext } from './positioning.types';
import {
  DEFAULT_BASE_RADIUS,
  DEFAULT_RADIUS_STEP,
  RING_LARGE_THRESHOLD,
  RING_RADIUS_LARGE,
  RING_RADIUS_SMALL,
  UP_ALIGNMENT_THRESHOLD,
} from './positioning.constants';

/** 트리를 DFS 순회하며 각 노드에 3D 좌표와 Euler Tour 타임스탬프를 부여한다. */
export function assignPositions(
  tree: Node,
  baseRadius = DEFAULT_BASE_RADIUS,
  radiusStep = DEFAULT_RADIUS_STEP,
): Map<number, PositionedNode> {
  const nodeMap = new Map<number, PositionedNode>();
  let timer = 0;

  function traverse(node: Node, depth: number, ctx: TraverseContext) {
    const entryTime = timer++;
    let position: Vec3;

    if (depth === 0) {
      position = computeRootPosition();
    } else if (depth === 1) {
      if (ctx.childIndex === undefined || ctx.siblingCount === undefined)
        throw new Error('Missing child indexing for spherical layout');
      position = computeSpherePosition(ctx.childIndex, ctx.siblingCount, baseRadius);
    } else {
      if (!ctx.parentPosition || !ctx.grandParentPosition) throw new Error('Missing position data');
      if (ctx.childIndex === undefined || ctx.siblingCount === undefined)
        throw new Error('Missing child indexing for ring layout');
      position = computeRingPosition(
        ctx.childIndex,
        ctx.siblingCount,
        ctx.parentPosition,
        ctx.grandParentPosition,
        radiusStep,
      );
    }

    const positionedNode: PositionedNode = {
      ...node,
      position,
      depth,
      parentPosition: ctx.parentPosition,
      entryTime,
      exitTime: -1,
    };

    nodeMap.set(node.id, positionedNode);

    node.children?.forEach((child, index) => {
      traverse(child, depth + 1, {
        parentPosition: position,
        grandParentPosition: ctx.parentPosition,
        childIndex: index,
        siblingCount: node.children!.length,
      });
    });

    positionedNode.exitTime = timer++;
  }

  traverse(tree, 0, {});
  return nodeMap;
}

/** 루트 노드 위치 — 원점. */
function computeRootPosition(): Vec3 {
  return [0, 0, 0];
}

/** depth 1 노드 위치 — golden section spiral로 구면 균등 분포. */
function computeSpherePosition(childIndex: number, siblingCount: number, radius: number): Vec3 {
  const increment = Math.PI * (3 - Math.sqrt(5));
  const offset = 2 / siblingCount;
  const y = 1 - childIndex * offset - offset / 2;
  const r = Math.sqrt(1 - y * y);
  const phi = childIndex * increment;

  return [Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius];
}

/** depth 2+ 노드 위치 — 부모→조부모 방향으로 전진 후 링 형태 배치. */
function computeRingPosition(
  childIndex: number,
  siblingCount: number,
  parentPosition: Vec3,
  grandParentPosition: Vec3,
  radiusStep: number,
): Vec3 {
  const parentVec = new THREE.Vector3(...parentPosition);
  const grandVec = new THREE.Vector3(...grandParentPosition);
  const dir = parentVec.clone().sub(grandVec).normalize().multiplyScalar(radiusStep);
  const center = parentVec.clone().add(dir);

  const angle = (childIndex / siblingCount) * 2 * Math.PI;
  const r = siblingCount > RING_LARGE_THRESHOLD ? RING_RADIUS_LARGE : RING_RADIUS_SMALL;
  const up = new THREE.Vector3(0, 1, 0);
  if (Math.abs(dir.dot(up)) > UP_ALIGNMENT_THRESHOLD) up.set(1, 0, 0);
  const tangent1 = new THREE.Vector3().crossVectors(dir, up).normalize();
  const tangent2 = new THREE.Vector3().crossVectors(dir, tangent1).normalize();

  const offset = tangent1
    .multiplyScalar(Math.cos(angle) * r)
    .add(tangent2.multiplyScalar(Math.sin(angle) * r));
  const final = center.clone().add(offset);
  return [final.x, final.y, final.z];
}
