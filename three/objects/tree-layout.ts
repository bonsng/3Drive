import { LANDING } from '../constants/landing';
import { fibonacciSphere } from '../utils/geometry';

const { tree: TREE } = LANDING;

export interface TreeNode {
  center: [x: number, y: number, z: number];
  parentIndex: number | null; // null for root
}

export interface TreeLayout {
  positions: Float32Array;
  nodes: TreeNode[];
}

/**
 * 2000개 파티클을 방사형 트리 구조로 배치한다.
 *
 * 구조:
 * - 루트 (중심 0,0,0): rootCount개 파티클 — 작은 구체
 * - Level 1 폴더 (folderCount개): 각 particlesPerFolder개 — 중심에서 folderDistance 거리
 * - Level 2 파일 (폴더당 filesPerFolder개): 각 particlesPerFile개 — 부모에서 fileDistance 거리
 *
 * @returns positions (count * 3 Float32Array) + nodes (연결선용 노드 중심 좌표)
 */
export function createTreeLayout(count: number): TreeLayout {
  const positions = new Float32Array(count * 3);
  const nodes: TreeNode[] = [];

  // 레벨별 로컬 좌표를 1번만 생성 (동일 파라미터 → 동일 결과)
  const folderCenters = fibonacciSphere(TREE.folderCount, TREE.folderDistance);
  const folderLocal = fibonacciSphere(TREE.particlesPerFolder, TREE.folderRadius);
  const fileOffsets = fibonacciSphere(TREE.filesPerFolder, TREE.fileDistance);
  const fileLocal = fibonacciSphere(TREE.particlesPerFile, TREE.fileRadius);

  // 루트 노드 등록
  nodes.push({ center: [0, 0, 0], parentIndex: null });

  let offset = 0;

  // --- Root: 중심의 작은 구체 ---
  // 폴더/파일에 배분 후 남는 파티클도 루트에 포함
  const allocated =
    TREE.folderCount * TREE.particlesPerFolder +
    TREE.folderCount * TREE.filesPerFolder * TREE.particlesPerFile;
  const rootCount = Math.max(TREE.rootCount, count - allocated);

  const rootPositions = fibonacciSphere(rootCount, TREE.rootRadius);
  positions.set(rootPositions, 0);
  offset += rootCount;

  // --- Level 1: 폴더 ---
  for (let f = 0; f < TREE.folderCount; f++) {
    const cx = folderCenters[f * 3];
    const cy = folderCenters[f * 3 + 1];
    const cz = folderCenters[f * 3 + 2];

    const folderNodeIndex = nodes.length;
    nodes.push({ center: [cx, cy, cz], parentIndex: 0 });

    for (let i = 0; i < TREE.particlesPerFolder; i++) {
      const idx = (offset + i) * 3;
      positions[idx] = folderLocal[i * 3] + cx;
      positions[idx + 1] = folderLocal[i * 3 + 1] + cy;
      positions[idx + 2] = folderLocal[i * 3 + 2] + cz;
    }
    offset += TREE.particlesPerFolder;

    // --- Level 2: 파일 ---
    for (let fi = 0; fi < TREE.filesPerFolder; fi++) {
      const fx = cx + fileOffsets[fi * 3];
      const fy = cy + fileOffsets[fi * 3 + 1];
      const fz = cz + fileOffsets[fi * 3 + 2];

      nodes.push({ center: [fx, fy, fz], parentIndex: folderNodeIndex });

      for (let i = 0; i < TREE.particlesPerFile; i++) {
        const idx = (offset + i) * 3;
        positions[idx] = fileLocal[i * 3] + fx;
        positions[idx + 1] = fileLocal[i * 3 + 1] + fy;
        positions[idx + 2] = fileLocal[i * 3 + 2] + fz;
      }
      offset += TREE.particlesPerFile;
    }
  }

  return { positions, nodes };
}
