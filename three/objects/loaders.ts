import { GLTFLoader } from 'three/addons';
import type { BufferGeometry, Material } from 'three/webgpu';
import { Mesh } from 'three/webgpu';
import { getModelPath } from '../constants/model-map';

// ── GLB loading & caching ───────────────────────────────────

interface CachedModel {
  geometry: BufferGeometry;
  material: Material;
}

const modelCache = new Map<string, CachedModel>();
const loader = new GLTFLoader();

function loadGLB(path: string): Promise<CachedModel> {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const mesh = gltf.scene.children[0] as Mesh;
        const cached: CachedModel = {
          geometry: mesh.geometry,
          material: mesh.material as Material,
        };
        modelCache.set(path, cached);
        resolve(cached);
      },
      undefined,
      reject,
    );
  });
}

export async function getModel(fileType: string): Promise<CachedModel> {
  const path = getModelPath(fileType);
  const cached = modelCache.get(path);
  if (cached) return cached;
  return loadGLB(path);
}

export function disposeModelCache(): void {
  for (const { geometry, material } of modelCache.values()) {
    geometry.dispose();
    material.dispose();
  }
  modelCache.clear();
}
