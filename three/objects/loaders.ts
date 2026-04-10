import { GLTFLoader } from 'three/addons';
import type { BufferGeometry, Material } from 'three/webgpu';
import { Mesh } from 'three/webgpu';

// ── Model path mapping ──────────────────────────────────────

const MODEL_MAP: Record<string, string> = {
  folder: '/models/folder_sphere_glb.glb',
  pdf: '/models/pdf_sphere_glb.glb',
  image: '/models/image_sphere_glb.glb',
  video: '/models/video_sphere_glb.glb',
  excel: '/models/excel_sphere_glb.glb',
  word: '/models/word_sphere_glb.glb',
  ppt: '/models/ppt_sphere_glb.glb',
  pptx: '/models/pptx_sphere_glb.glb',
  photoshop: '/models/photoshop_sphere_glb.glb',
  music: '/models/music_sphere_glb.glb',
  zip: '/models/zip_sphere_glb.glb',
  free: '/models/free_sphere_glb.glb',
};

export function getModelPath(fileType: string): string {
  return MODEL_MAP[fileType] ?? MODEL_MAP.free;
}

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
