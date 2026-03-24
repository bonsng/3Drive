/**
 * normalizeBackendTree
 * 1. id resolution: folderId → fileId → -1 fallback
 * 2. Field mapping: name, type, parentId, createdAt, updatedAt
 * 3. Children normalization: null/undefined → empty array, recursive conversion
 *
 * processBackendTree
 * 1. Trash separation: '휴지통' node removed from root, its children returned as trashData
 * 2. No trash node: trashData is empty array, treeData unchanged
 * 3. Empty trash: trash node exists but has no children
 */

import type { BackendNode } from '@/types/node';
import { normalizeBackendTree, processBackendTree } from '../tree-transform';

const makeBackendNode = (overrides: Partial<BackendNode> = {}): BackendNode => ({
  type: 'folder',
  name: 'test',
  parentId: null,
  folderId: 1,
  fileId: null,
  ...overrides,
});

describe('normalizeBackendTree', () => {
  it('should use folderId as id when present', () => {
    const result = normalizeBackendTree(makeBackendNode({ folderId: 10, fileId: 20 }));
    expect(result.id).toBe(10);
  });

  it('should fall back to fileId when folderId is null', () => {
    const result = normalizeBackendTree(makeBackendNode({ folderId: null, fileId: 20 }));
    expect(result.id).toBe(20);
  });

  it('should fall back to -1 when both folderId and fileId are null', () => {
    const result = normalizeBackendTree(makeBackendNode({ folderId: null, fileId: null }));
    expect(result.id).toBe(-1);
  });

  it('should map name, type, parentId, createdAt, updatedAt', () => {
    const result = normalizeBackendTree(
      makeBackendNode({
        name: 'docs',
        type: 'folder',
        parentId: 5,
        createdAt: '2025-01-01',
        updatedAt: '2025-06-01',
      }),
    );
    expect(result.name).toBe('docs');
    expect(result.type).toBe('folder');
    expect(result.parentId).toBe(5);
    expect(result.createdAt).toBe('2025-01-01');
    expect(result.updatedAt).toBe('2025-06-01');
  });

  it('should convert null children to empty array', () => {
    const result = normalizeBackendTree(makeBackendNode({ children: null }));
    expect(result.children).toEqual([]);
  });

  it('should convert undefined children to empty array', () => {
    const result = normalizeBackendTree(makeBackendNode({ children: undefined }));
    expect(result.children).toEqual([]);
  });

  it('should recursively normalize children', () => {
    const result = normalizeBackendTree(
      makeBackendNode({
        folderId: 1,
        children: [makeBackendNode({ folderId: null, fileId: 2, name: 'child.txt', type: 'file' })],
      }),
    );
    expect(result.children).toHaveLength(1);
    expect(result.children![0].id).toBe(2);
    expect(result.children![0].name).toBe('child.txt');
  });
});

describe('processBackendTree', () => {
  it('should separate trash node from root children', () => {
    const tree = makeBackendNode({
      children: [
        makeBackendNode({ folderId: 2, name: '문서' }),
        makeBackendNode({
          folderId: 3,
          name: '휴지통',
          children: [
            makeBackendNode({ folderId: null, fileId: 4, name: 'deleted.txt', type: 'file' }),
          ],
        }),
      ],
    });

    const { treeData, trashData } = processBackendTree(tree);

    expect(treeData.children).toHaveLength(1);
    expect(treeData.children![0].name).toBe('문서');
    expect(trashData).toHaveLength(1);
    expect(trashData[0].name).toBe('deleted.txt');
  });

  it('should return empty trashData when no trash node exists', () => {
    const tree = makeBackendNode({
      children: [makeBackendNode({ folderId: 2, name: '문서' })],
    });

    const { treeData, trashData } = processBackendTree(tree);

    expect(treeData.children).toHaveLength(1);
    expect(trashData).toEqual([]);
  });

  it('should return empty trashData when trash node has no children', () => {
    const tree = makeBackendNode({
      children: [makeBackendNode({ folderId: 3, name: '휴지통', children: null })],
    });

    const { treeData, trashData } = processBackendTree(tree);

    expect(treeData.children).toHaveLength(0);
    expect(trashData).toEqual([]);
  });
});
