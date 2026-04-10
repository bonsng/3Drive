import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Scene,
} from 'three/webgpu';
import { LANDING } from '../constants/landing';
import type { TreeNode } from './tree-layout';

const { drag: DRAG } = LANDING;
const DRAG_SET = new Set(DRAG.nodeIndices);

function makeMesh(scene: Scene, vertices: number[]) {
  if (vertices.length === 0) return null;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  const material = new LineBasicMaterial({ color: 0x6688ff, transparent: true, opacity: 0 });
  const mesh = new LineSegments(geometry, material);
  scene.add(mesh);
  return { mesh, material, geometry };
}

/**
 * 트리 연결선. static / drag(fade out) / new(fade in) 3그룹.
 */
export function createTreeLines(scene: Scene, nodes: TreeNode[]) {
  const staticVerts: number[] = [];
  const dragVerts: number[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.parentIndex === null) continue;
    const verts = DRAG_SET.has(i) ? dragVerts : staticVerts;
    verts.push(...nodes[node.parentIndex].center, ...node.center);
  }

  // 새 연결선: folder5→destCenter, destCenter→각 자식 파일
  const newVerts: number[] = [];
  if (nodes[DRAG.targetFolderIndex]) {
    newVerts.push(...nodes[DRAG.targetFolderIndex].center, ...DRAG.destCenter);
    for (const file of DRAG.destFiles) {
      newVerts.push(...DRAG.destCenter, ...file);
    }
  }

  const groups = [
    makeMesh(scene, staticVerts),
    makeMesh(scene, dragVerts),
    makeMesh(scene, newVerts),
  ];

  return {
    update(expandT: number, dragProgress = 0) {
      const base = expandT * 0.4;
      if (groups[0]) groups[0].material.opacity = base;
      if (groups[1]) groups[1].material.opacity = base * (1 - dragProgress);
      if (groups[2]) groups[2].material.opacity = base * Math.max(0, (dragProgress - 0.8) / 0.2);
    },
    dispose() {
      for (const g of groups) {
        if (!g) continue;
        scene.remove(g.mesh);
        g.geometry.dispose();
        g.material.dispose();
      }
    },
  };
}
