/**
 * getDescendantIds
 * 1. Returns all descendants (children, grandchildren, etc.)
 * 2. Does not include the node itself
 * 3. Leaf node returns empty set
 * 4. Non-existent nodeId returns empty set
 * 5. Empty map returns empty set
 * 6. Root node returns all other nodes
 */

import { getDescendantIds } from '../tree-utils';
import type { PositionedNode } from '@/types/node';

function makeNode(
  id: number,
  parentId: number | null,
  depth: number,
  entryTime: number,
  exitTime: number,
): PositionedNode {
  return {
    id,
    parentId,
    name: `node-${id}`,
    type: 'file',
    position: [0, 0, 0],
    depth,
    entryTime,
    exitTime,
  };
}

/**
 * Test tree structure:
 *
 *        1 (root)
 *       / \
 *      2   3
 *     /   / \
 *    4   5   6
 *            |
 *            7
 *
 * DFS order: 1 → 2 → 4 → 3 → 5 → 6 → 7
 *
 * Euler Tour timestamps:
 *   Node 1: entry=0,  exit=13
 *   Node 2: entry=1,  exit=4
 *   Node 4: entry=2,  exit=3
 *   Node 3: entry=5,  exit=12
 *   Node 5: entry=6,  exit=7
 *   Node 6: entry=8,  exit=11
 *   Node 7: entry=9,  exit=10
 */
function buildTestMap(): Map<number, PositionedNode> {
  const map = new Map<number, PositionedNode>();
  map.set(1, makeNode(1, null, 0, 0, 13));
  map.set(2, makeNode(2, 1, 1, 1, 4));
  map.set(4, makeNode(4, 2, 2, 2, 3));
  map.set(3, makeNode(3, 1, 1, 5, 12));
  map.set(5, makeNode(5, 3, 2, 6, 7));
  map.set(6, makeNode(6, 3, 2, 8, 11));
  map.set(7, makeNode(7, 6, 3, 9, 10));
  return map;
}

describe('getDescendantIds', () => {
  const nodeMap = buildTestMap();

  it('returns direct children', () => {
    const result = getDescendantIds(1, nodeMap);
    expect(result).toContain(2);
    expect(result).toContain(3);
  });

  it('returns deep descendants (grandchildren+)', () => {
    const result = getDescendantIds(1, nodeMap);
    expect(result).toContain(4);
    expect(result).toContain(5);
    expect(result).toContain(6);
    expect(result).toContain(7);
  });

  it('does not include the node itself', () => {
    const result = getDescendantIds(1, nodeMap);
    expect(result).not.toContain(1);
  });

  it('returns subtree descendants for intermediate node', () => {
    const result = getDescendantIds(3, nodeMap);
    expect(result).toEqual(new Set([5, 6, 7]));
  });

  it('returns empty set for leaf node', () => {
    const result = getDescendantIds(7, nodeMap);
    expect(result.size).toBe(0);
  });

  it('returns empty set for non-existent nodeId', () => {
    const result = getDescendantIds(999, nodeMap);
    expect(result.size).toBe(0);
  });

  it('returns empty set for empty map', () => {
    const result = getDescendantIds(1, new Map());
    expect(result.size).toBe(0);
  });

  it('root node returns all other nodes', () => {
    const result = getDescendantIds(1, nodeMap);
    expect(result.size).toBe(6);
  });
});
