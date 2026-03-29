import { LANDING } from '../constants';
import type { TreeLayout } from '../objects/tree-layout';

const { tree: TREE, sphere: SPHERE } = LANDING;

export interface DragData {
  /** per-particle flag: 1 = 드래그 대상, 0 = 일반 */
  dragGroup: Float32Array;
  /** per-particle 드래그 목표 좌표 (x,y,z) */
  dragTarget: Float32Array;
}

/**
 * 드래그 애니메이션용 데이터 생성.
 * 첫 번째 폴더의 첫 번째 파일 노드 파티클을 선택하여
 * 두 번째 폴더 근처로 이동하는 드래그 그룹을 만든다.
 */
export function createDragData(layout: TreeLayout): DragData {
  const count = SPHERE.count;
  const dragGroup = new Float32Array(count);
  const dragTarget = new Float32Array(count * 3);

  // 파티클 배치 순서: root → folder1 → file1_1, file1_2, file1_3 → folder2 → ...
  const allocated =
    TREE.folderCount * TREE.particlesPerFolder +
    TREE.folderCount * TREE.filesPerFolder * TREE.particlesPerFile;
  const rootCount = Math.max(TREE.rootCount, count - allocated);

  // 첫 번째 파일 = rootCount + folder1 파티클 뒤
  const firstFileStart = rootCount + TREE.particlesPerFolder;
  const fileCount = TREE.particlesPerFile;

  // 목표: 두 번째 폴더의 중심 근처
  // nodes: [root, folder1, file1_1, file1_2, file1_3, folder2, ...]
  const folder2Index = 1 + 1 + TREE.filesPerFolder; // = 5
  const targetCenter = layout.nodes[folder2Index]?.center ?? [1.5, 0.5, 0];

  // 원래 파일 클러스터의 중심 (첫 번째 파일의 첫 파티클 기준)
  const srcCx = layout.positions[firstFileStart * 3];
  const srcCy = layout.positions[firstFileStart * 3 + 1];
  const srcCz = layout.positions[firstFileStart * 3 + 2];

  for (let i = 0; i < fileCount; i++) {
    const pi = firstFileStart + i;
    dragGroup[pi] = 1;

    // 원래 클러스터 내 상대 위치를 유지하면서 목표 중심으로 이동
    const relX = layout.positions[pi * 3] - srcCx;
    const relY = layout.positions[pi * 3 + 1] - srcCy;
    const relZ = layout.positions[pi * 3 + 2] - srcCz;

    dragTarget[pi * 3] = targetCenter[0] + relX;
    dragTarget[pi * 3 + 1] = targetCenter[1] + relY;
    dragTarget[pi * 3 + 2] = targetCenter[2] + relZ;
  }

  return { dragGroup, dragTarget };
}
