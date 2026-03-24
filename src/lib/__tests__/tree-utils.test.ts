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
import { assignPositions } from '../positioning';
import { sampleTree } from './fixtures/sample-data';
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

  describe('sampleTree integration', () => {
    const sampleMap = assignPositions(sampleTree);

    it('root returns all 36 descendants', () => {
      const result = getDescendantIds(1, sampleMap);
      expect(result.size).toBe(36);
      expect(result).not.toContain(1);
    });

    it('documents folder returns 15 descendants', () => {
      // documents(2) → resume(3), cover_letter(4), projects(5), project1(6),
      // project2(7), archive(8), old_project1(9), old_project2(10),
      // archive_sub(321), archive_sub_sub(401), archive5(777),
      // invoices(11), invoice_jan(12), invoice_feb(13), invoice_mar(14)
      const result = getDescendantIds(2, sampleMap);
      expect(result.size).toBe(15);
      expect(result).toContain(777); // deepest node
    });

    it('leaf node returns empty set', () => {
      const result = getDescendantIds(33, sampleMap); // todo.txt
      expect(result.size).toBe(0);
    });

    it('subtree does not leak into sibling subtrees', () => {
      const imagesDescendants = getDescendantIds(15, sampleMap);
      // images 하위에 documents 노드가 포함되면 안 됨
      expect(imagesDescendants).not.toContain(2);
      expect(imagesDescendants).not.toContain(3);
      expect(imagesDescendants.size).toBe(5); // 16,17,18,19,20
    });
  });
});
