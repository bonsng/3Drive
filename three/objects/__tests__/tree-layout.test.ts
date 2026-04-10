/**
 * @module three/objects/tree-layout
 *
 * createTreeLayout
 * 1. count * 3 길이의 Float32Array를 반환한다
 * 2. 루트 노드(parentIndex: null)가 정확히 1개 존재한다
 * 3. 모든 Level 1 노드의 parentIndex가 0 (루트)이다
 * 4. 모든 Level 2 노드의 parentIndex가 Level 1 노드를 가리킨다
 * 5. 노드 수 = 1 (root) + folderCount + folderCount * filesPerFolder
 * 6. 폴더 중심이 원점에서 약 folderDistance 거리에 있다
 * 7. 파일 중심이 부모 폴더에서 약 fileDistance 거리에 있다
 */
import { describe, it, expect } from 'vitest';
import { createTreeLayout } from '../tree-layout';
import { LANDING } from '../../constants/landing';

const { tree: TREE } = LANDING;
const COUNT = 2000;

describe('createTreeLayout', () => {
  const layout = createTreeLayout(COUNT);

  it('count * 3 길이의 Float32Array를 반환한다', () => {
    expect(layout.positions).toBeInstanceOf(Float32Array);
    expect(layout.positions.length).toBe(COUNT * 3);
  });

  it('루트 노드가 정확히 1개 존재한다', () => {
    const roots = layout.nodes.filter((n) => n.parentIndex === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].center).toEqual([0, 0, 0]);
  });

  it('모든 Level 1 노드의 parentIndex가 0이다', () => {
    const folders = layout.nodes.filter((n) => n.parentIndex === 0);
    expect(folders).toHaveLength(TREE.folderCount);
  });

  it('모든 Level 2 노드가 Level 1 노드를 가리킨다', () => {
    const folderIndices = new Set(
      layout.nodes.map((n, i) => (n.parentIndex === 0 ? i : -1)).filter((i) => i >= 0),
    );

    const files = layout.nodes.filter((n) => n.parentIndex !== null && n.parentIndex !== 0);
    expect(files).toHaveLength(TREE.folderCount * TREE.filesPerFolder);
    for (const file of files) {
      expect(folderIndices.has(file.parentIndex!)).toBe(true);
    }
  });

  it('노드 총 수가 올바르다', () => {
    const expected = 1 + TREE.folderCount + TREE.folderCount * TREE.filesPerFolder;
    expect(layout.nodes).toHaveLength(expected);
  });

  it('폴더 중심이 원점에서 약 folderDistance 거리에 있다', () => {
    const folders = layout.nodes.filter((n) => n.parentIndex === 0);
    for (const folder of folders) {
      const [x, y, z] = folder.center;
      const dist = Math.sqrt(x * x + y * y + z * z);
      expect(dist).toBeCloseTo(TREE.folderDistance, 1);
    }
  });

  it('파일 중심이 부모 폴더에서 약 fileDistance 거리에 있다', () => {
    const files = layout.nodes.filter((n) => n.parentIndex !== null && n.parentIndex !== 0);
    for (const file of files) {
      const parent = layout.nodes[file.parentIndex!];
      const [fx, fy, fz] = file.center;
      const [px, py, pz] = parent.center;
      const dist = Math.sqrt((fx - px) ** 2 + (fy - py) ** 2 + (fz - pz) ** 2);
      expect(dist).toBeCloseTo(TREE.fileDistance, 1);
    }
  });
});
