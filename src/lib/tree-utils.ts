import type { PositionedNode } from '@/types/node';

export function getDescendantIds(
  nodeId: number,
  nodeMap: Map<number, PositionedNode>,
): Set<number> {
  const descendants = new Set<number>();

  for (const [id, node] of nodeMap.entries()) {
    let current = node.parentId;
    while (current) {
      if (current === nodeId) {
        descendants.add(id);
        break;
      }
      current = nodeMap.get(current)?.parentId ?? null;
    }
  }

  return descendants;
}
