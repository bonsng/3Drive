import { CanvasTexture, LinearFilter, Sprite, SpriteMaterial } from 'three/webgpu';
import { LABEL_FONT, LABEL_FONT_SIZE, LABEL_PADDING, LABEL_SCALE_FACTOR } from '../constants/label';

export function createTextSprite(text: string): Sprite {
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  measureCtx.font = LABEL_FONT;
  const metrics = measureCtx.measureText(text);

  const width = Math.ceil(metrics.width + LABEL_PADDING * 2);
  const height = LABEL_FONT_SIZE + LABEL_PADDING * 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.font = LABEL_FONT;
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, LABEL_PADDING, height / 2);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new Sprite(material);
  sprite.scale.set(width * LABEL_SCALE_FACTOR, height * LABEL_SCALE_FACTOR, 1);

  return sprite;
}

export function disposeSprite(sprite: Sprite): void {
  const material = sprite.material as SpriteMaterial;
  material.map?.dispose();
  material.dispose();
}
