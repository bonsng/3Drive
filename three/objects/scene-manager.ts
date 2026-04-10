import {
  BufferGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Scene,
  Sprite,
} from 'three/webgpu';
import type { Node, PositionedNode } from '../../src/types/node';
import { assignPositions } from '../../src/lib/positioning';
import { LABEL_Y_OFFSET, LINE_COLOR, LINE_OPACITY } from '../constants/scene';
import { getModel, disposeModelCache } from './loaders';
import { createTextSprite, disposeSprite } from './file-node';
import { filterByDepth, groupByFileType } from './scene-utils';

interface NodeEntry {
  instanceId: number;
  fileType: string;
  label: Sprite;
}

export class SceneManager {
  private scene: Scene;
  private nodeMap = new Map<number, NodeEntry>();
  private instancedMeshes = new Map<string, InstancedMesh>();
  private labels: Sprite[] = [];
  private lines: LineSegments | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  async renderTree(tree: Node, currentFolderId: number): Promise<void> {
    this.clearTree();

    const positionedNodes = assignPositions(tree);
    const rootNode = positionedNodes.get(currentFolderId);
    if (!rootNode) return;

    const visible = filterByDepth(positionedNodes, rootNode.depth, 2);
    const groups = groupByFileType(visible);

    const modelPromises = Array.from(groups.entries()).map(async ([fileType, nodes]) => {
      const { geometry, material } = await getModel(fileType);
      const mesh = new InstancedMesh(geometry, material, nodes.length);

      const matrix = new Matrix4();
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const [x, y, z] = node.position;
        matrix.makeTranslation(x, y, z);
        mesh.setMatrixAt(i, matrix);

        const label = createTextSprite(node.name);
        label.position.set(x, y + LABEL_Y_OFFSET, z);
        this.scene.add(label);
        this.labels.push(label);

        this.nodeMap.set(node.id, { instanceId: i, fileType, label });
      }

      mesh.instanceMatrix.needsUpdate = true;
      this.scene.add(mesh);
      this.instancedMeshes.set(fileType, mesh);
    });

    await Promise.all(modelPromises);

    this.createLines(visible, positionedNodes);
  }

  private createLines(visible: PositionedNode[], allNodes: Map<number, PositionedNode>): void {
    const vertices: number[] = [];
    for (const node of visible) {
      if (node.parentId === null) continue;
      const parent = allNodes.get(node.parentId);
      if (!parent) continue;
      vertices.push(...parent.position, ...node.position);
    }

    if (vertices.length === 0) return;

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    const material = new LineBasicMaterial({
      color: LINE_COLOR,
      transparent: true,
      opacity: LINE_OPACITY,
    });
    this.lines = new LineSegments(geometry, material);
    this.scene.add(this.lines);
  }

  clearTree(): void {
    for (const mesh of this.instancedMeshes.values()) {
      this.scene.remove(mesh);
      mesh.dispose();
    }
    this.instancedMeshes.clear();

    for (const label of this.labels) {
      this.scene.remove(label);
      disposeSprite(label);
    }
    this.labels = [];

    if (this.lines) {
      this.scene.remove(this.lines);
      this.lines.geometry.dispose();
      (this.lines.material as LineBasicMaterial).dispose();
      this.lines = null;
    }

    this.nodeMap.clear();
  }

  dispose(): void {
    this.clearTree();
    disposeModelCache();
  }
}
