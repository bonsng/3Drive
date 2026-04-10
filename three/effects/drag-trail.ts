import { LANDING } from '../constants/landing';
import type { TreeLayout } from '../objects/tree-layout';

const { tree: TREE, sphere: SPHERE, drag: DRAG } = LANDING;

export interface DragData {
  dragGroup: Float32Array;
  dragTarget: Float32Array;
}

/**
 * 첫 번째 폴더 전체를 DRAG.destCenter로 이동하는 드래그 데이터 생성.
 */
export function createDragData(layout: TreeLayout): DragData {
  const count = SPHERE.count;
  const dragGroup = new Float32Array(count);
  const dragTarget = new Float32Array(count * 3);

  const allocated =
    TREE.folderCount * (TREE.particlesPerFolder + TREE.filesPerFolder * TREE.particlesPerFile);
  const folder1Start = Math.max(TREE.rootCount, count - allocated);
  const dragCount = TREE.particlesPerFolder + TREE.filesPerFolder * TREE.particlesPerFile;
  const folder1Center = layout.nodes[1].center;

  for (let i = 0; i < dragCount; i++) {
    const pi = folder1Start + i;
    dragGroup[pi] = 1;
    dragTarget[pi * 3] = DRAG.destCenter[0] + layout.positions[pi * 3] - folder1Center[0];
    dragTarget[pi * 3 + 1] = DRAG.destCenter[1] + layout.positions[pi * 3 + 1] - folder1Center[1];
    dragTarget[pi * 3 + 2] = DRAG.destCenter[2] + layout.positions[pi * 3 + 2] - folder1Center[2];
  }

  return { dragGroup, dragTarget };
}
