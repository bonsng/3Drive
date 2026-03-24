/**
 * normalizeBackendTree
 * 1. id resolution: folderId → fileId → -1 fallback
 * 2. Field mapping: name, type, parentId, createdAt, updatedAt
 * 3. Children normalization: null/undefined → empty array, recursive conversion
 *
 * processBackendResponse
 * 1. Normalizes root tree via normalizeBackendTree
 * 2. Normalizes each trash node independently
 * 3. Empty trash array returns empty trashData
 */

import type { BackendNode } from '@/types/node';
import { normalizeBackendTree, processBackendResponse } from '../tree-transform';

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

describe('processBackendResponse', () => {
  it('should normalize root and trash separately', () => {
    const response = {
      root: makeBackendNode({
        folderId: 1,
        name: 'root',
        children: [makeBackendNode({ folderId: 2, name: '문서' })],
      }),
      trash: [makeBackendNode({ folderId: null, fileId: 4, name: 'deleted.txt', type: 'file' })],
    };

    const { treeData, trashData } = processBackendResponse(response);

    expect(treeData.name).toBe('root');
    expect(treeData.children).toHaveLength(1);
    expect(treeData.children![0].name).toBe('문서');
    expect(trashData).toHaveLength(1);
    expect(trashData[0].id).toBe(4);
    expect(trashData[0].name).toBe('deleted.txt');
  });

  it('should return empty trashData when trash array is empty', () => {
    const response = {
      root: makeBackendNode({ folderId: 1, name: 'root' }),
      trash: [],
    };

    const { treeData, trashData } = processBackendResponse(response);

    expect(treeData.name).toBe('root');
    expect(trashData).toEqual([]);
  });
});
