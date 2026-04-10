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
