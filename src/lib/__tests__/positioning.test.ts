/**
 * assignPositions
 * 1. Root node positioned at origin [0,0,0]
 * 2. Depth-1 children distributed on sphere at baseRadius distance
 * 3. Depth-2+ children placed in ring layout along parent→grandparent direction
 * 4. entryTime/exitTime assigned in DFS order
 * 5. Single root node works correctly
 */

import { assignPositions } from '../positioning';
import { sampleTree } from './fixtures/sample-data';
import type { Node } from '@/types/node';

function makeTree(overrides: Partial<Node> = {}): Node {
  return {
    id: 1,
    name: 'root',
    type: 'folder',
    parentId: null,
    children: [],
    ...overrides,
  };
}

function distance(a: [number, number, number]): number {
  return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
}

describe('assignPositions', () => {
  it('places root at origin', () => {
    const tree = makeTree();
    const map = assignPositions(tree);
    expect(map.get(1)!.position).toEqual([0, 0, 0]);
  });

  it('places depth-1 children at baseRadius distance', () => {
    const baseRadius = 0.9;
    const tree = makeTree({
      children: [
        { id: 2, name: 'a', type: 'file', parentId: 1 },
        { id: 3, name: 'b', type: 'file', parentId: 1 },
        { id: 4, name: 'c', type: 'file', parentId: 1 },
      ],
    });

    const map = assignPositions(tree, baseRadius);

    for (const id of [2, 3, 4]) {
      const d = distance(map.get(id)!.position);
      expect(d).toBeCloseTo(baseRadius, 5);
    }
  });

  it('places depth-2 children further from origin than their parent', () => {
    const tree = makeTree({
      children: [
        {
          id: 2,
          name: 'folder',
          type: 'folder',
          parentId: 1,
          children: [{ id: 3, name: 'file', type: 'file', parentId: 2 }],
        },
      ],
    });

    const map = assignPositions(tree);
    const parentDist = distance(map.get(2)!.position);
    const childDist = distance(map.get(3)!.position);
    expect(childDist).toBeGreaterThan(parentDist);
  });

  describe('Euler Tour timestamps', () => {
    const tree = makeTree({
      children: [
        {
          id: 2,
          name: 'a',
          type: 'folder',
          parentId: 1,
          children: [{ id: 4, name: 'a1', type: 'file', parentId: 2 }],
        },
        {
          id: 3,
          name: 'b',
          type: 'folder',
          parentId: 1,
          children: [{ id: 5, name: 'b1', type: 'file', parentId: 3 }],
        },
      ],
    });

    const map = assignPositions(tree);

    it('assigns entryTime < exitTime for every node', () => {
      for (const node of map.values()) {
        expect(node.entryTime).toBeLessThan(node.exitTime);
      }
    });

    it('parent entry < child entry and child exit < parent exit', () => {
      const root = map.get(1)!;
      const child = map.get(2)!;
      const grandchild = map.get(4)!;

      expect(root.entryTime).toBeLessThan(child.entryTime);
      expect(child.exitTime).toBeLessThan(root.exitTime);

      expect(child.entryTime).toBeLessThan(grandchild.entryTime);
      expect(grandchild.exitTime).toBeLessThan(child.exitTime);
    });

    it('sibling subtrees have non-overlapping time ranges', () => {
      const nodeA = map.get(2)!;
      const nodeB = map.get(3)!;
      expect(nodeA.exitTime).toBeLessThan(nodeB.entryTime);
    });
  });

  it('handles single root node', () => {
    const tree = makeTree();
    const map = assignPositions(tree);
    expect(map.size).toBe(1);

    const root = map.get(1)!;
    expect(root.entryTime).toBe(0);
    expect(root.exitTime).toBe(1);
  });

  describe('sampleTree integration', () => {
    const map = assignPositions(sampleTree);

    it('positions all 37 nodes', () => {
      expect(map.size).toBe(37);
    });

    it('assigns unique positions to every node', () => {
      const positions = new Set([...map.values()].map((n) => n.position.join(',')));
      expect(positions.size).toBe(37);
    });

    it('assigns correct depth for deeply nested nodes', () => {
      expect(map.get(1)!.depth).toBe(0); // root
      expect(map.get(2)!.depth).toBe(1); // documents
      expect(map.get(5)!.depth).toBe(2); // projects
      expect(map.get(8)!.depth).toBe(3); // archive
      expect(map.get(321)!.depth).toBe(4); // archive_sub
      expect(map.get(401)!.depth).toBe(5); // archive_sub_sub
    });

    it('satisfies Euler Tour invariant for all parent-child pairs', () => {
      for (const node of map.values()) {
        if (node.parentId === null) continue;
        const parent = map.get(node.parentId)!;
        expect(parent.entryTime).toBeLessThan(node.entryTime);
        expect(node.exitTime).toBeLessThan(parent.exitTime);
      }
    });
  });
});
