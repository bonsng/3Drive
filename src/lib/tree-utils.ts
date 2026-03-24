import type { PositionedNode } from '@/types/node';

/** Euler Tour 타임스탬프를 이용해 특정 노드의 모든 자손 ID를 반환한다. */
export function getDescendantIds(
  nodeId: number,
  nodeMap: Map<number, PositionedNode>,
): Set<number> {
  const target = nodeMap.get(nodeId);
  if (!target) return new Set();

  const descendants = new Set<number>();
  for (const [id, node] of nodeMap.entries()) {
    if (node.entryTime > target.entryTime && node.exitTime < target.exitTime) {
      descendants.add(id);
    }
  }
  return descendants;
}
