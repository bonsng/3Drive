import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Scene,
} from 'three/webgpu';
import type { TreeNode } from './tree-layout';

/**
 * 트리 노드 간 연결선.
 * parent → child 쌍을 LineSegments로 렌더링.
 * expandT (0→1)에 연동하여 fade in.
 */
export function createTreeLines(scene: Scene, nodes: TreeNode[]) {
  const vertices: number[] = [];

  for (const node of nodes) {
    if (node.parentIndex === null) continue;
    const parent = nodes[node.parentIndex];
    vertices.push(...parent.center, ...node.center);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

  const material = new LineBasicMaterial({
    color: 0x6688ff,
    transparent: true,
    opacity: 0,
  });

  const lines = new LineSegments(geometry, material);
  scene.add(lines);

  return {
    /** expandT 0→1 에 따라 연결선 opacity 업데이트 */
    update(expandT: number) {
      material.opacity = expandT * 0.4;
    },
    dispose() {
      scene.remove(lines);
      geometry.dispose();
      material.dispose();
    },
  };
}
