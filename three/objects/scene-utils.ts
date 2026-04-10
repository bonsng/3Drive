import type { PositionedNode } from '../../src/types/node';
import { getTypeFromExtension } from '../../src/lib/extension';

export function filterByDepth(
  nodeMap: Map<number, PositionedNode>,
  rootDepth: number,
  maxDepth: number,
): PositionedNode[] {
  const result: PositionedNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.depth >= rootDepth && node.depth <= rootDepth + maxDepth) {
      result.push(node);
    }
  }
  return result;
}

export function groupByFileType(nodes: PositionedNode[]): Map<string, PositionedNode[]> {
  const groups = new Map<string, PositionedNode[]>();
  for (const node of nodes) {
    const fileType =
      node.type === 'folder' ? 'folder' : getTypeFromExtension(node.extension ?? undefined);
    const list = groups.get(fileType) ?? [];
    list.push(node);
    groups.set(fileType, list);
  }
  return groups;
}
