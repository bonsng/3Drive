/**
 * scene-utils.ts
 * 1. filterByDepth returns only nodes within maxDepth from the root
 * 2. filterByDepth includes the root node itself
 * 3. groupByFileType groups PositionedNodes by their resolved FileType
 * 4. groupByFileType assigns 'folder' type to folder nodes
 * 5. groupByFileType assigns 'free' type to files without extension
 */
import { describe, it, expect } from 'vitest';
import { filterByDepth, groupByFileType } from '../scene-utils';
import type { PositionedNode } from '../../../src/types/node';
import type { Vec3 } from '../../../src/lib/positioning.types';

function makeNode(overrides: Partial<PositionedNode> & { id: number }): PositionedNode {
  return {
    type: 'file',
    name: 'test',
    parentId: null,
    position: [0, 0, 0] as Vec3,
    depth: 0,
    entryTime: 0,
    exitTime: 1,
    ...overrides,
  };
}

describe('filterByDepth', () => {
  it('returns nodes within maxDepth from root depth', () => {
    const nodes = new Map<number, PositionedNode>([
      [1, makeNode({ id: 1, depth: 0 })],
      [2, makeNode({ id: 2, depth: 1 })],
      [3, makeNode({ id: 3, depth: 2 })],
      [4, makeNode({ id: 4, depth: 3 })],
    ]);
    const result = filterByDepth(nodes, 0, 2);
    expect(result.map((n) => n.id)).toEqual([1, 2, 3]);
  });

  it('includes the root node', () => {
    const nodes = new Map<number, PositionedNode>([
      [1, makeNode({ id: 1, depth: 0 })],
      [2, makeNode({ id: 2, depth: 1 })],
    ]);
    const result = filterByDepth(nodes, 0, 2);
    expect(result.some((n) => n.id === 1)).toBe(true);
  });
});

describe('groupByFileType', () => {
  it('groups nodes by resolved FileType', () => {
    const nodes: PositionedNode[] = [
      makeNode({ id: 1, name: 'a.pdf', extension: 'pdf' }),
      makeNode({ id: 2, name: 'b.pdf', extension: 'pdf' }),
      makeNode({ id: 3, name: 'c.png', extension: 'png' }),
    ];
    const groups = groupByFileType(nodes);
    expect(groups.get('pdf')?.length).toBe(2);
    expect(groups.get('image')?.length).toBe(1);
  });

  it('assigns folder type to folder nodes', () => {
    const nodes: PositionedNode[] = [makeNode({ id: 1, type: 'folder', name: 'docs' })];
    const groups = groupByFileType(nodes);
    expect(groups.get('folder')?.length).toBe(1);
  });

  it('assigns free type to files without extension', () => {
    const nodes: PositionedNode[] = [makeNode({ id: 1, name: 'readme' })];
    const groups = groupByFileType(nodes);
    expect(groups.get('free')?.length).toBe(1);
  });
});
