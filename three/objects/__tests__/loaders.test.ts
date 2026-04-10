/**
 * loaders.ts
 * 1. getModelPath returns correct sphere model path for each FileType
 * 2. getModelPath returns fallback path for unknown types
 * 3. getModelPath returns folder model for 'folder' type
 */
import { describe, it, expect } from 'vitest';
import { getModelPath } from '../loaders';

describe('getModelPath', () => {
  it.each([
    ['pdf', '/models/pdf_sphere_glb.glb'],
    ['image', '/models/image_sphere_glb.glb'],
    ['video', '/models/video_sphere_glb.glb'],
    ['excel', '/models/excel_sphere_glb.glb'],
    ['word', '/models/word_sphere_glb.glb'],
    ['ppt', '/models/ppt_sphere_glb.glb'],
    ['pptx', '/models/pptx_sphere_glb.glb'],
    ['photoshop', '/models/photoshop_sphere_glb.glb'],
    ['music', '/models/music_sphere_glb.glb'],
    ['zip', '/models/zip_sphere_glb.glb'],
  ])('returns correct path for %s', (fileType, expectedPath) => {
    expect(getModelPath(fileType)).toBe(expectedPath);
  });

  it('returns free_sphere_glb.glb for unknown types', () => {
    expect(getModelPath('unknown')).toBe('/models/free_sphere_glb.glb');
  });

  it('returns folder_sphere_glb.glb for folder', () => {
    expect(getModelPath('folder')).toBe('/models/folder_sphere_glb.glb');
  });
});
