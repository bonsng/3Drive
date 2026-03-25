import {
  AdditiveBlending,
  InstancedBufferAttribute,
  PointsNodeMaterial,
  Scene,
  Sprite,
} from 'three/webgpu';
import {
  color,
  float,
  instancedBufferAttribute,
  sin,
  smoothstep,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import { LANDING } from '../constants';
import { randomPositions, randomSeeds } from '../utils/geometry';

const { ambient: CFG } = LANDING;

export function createAmbientParticles(scene: Scene) {
  const positions = randomPositions(CFG.count, CFG.spread, [-CFG.spread, -1.5]);
  const seeds = randomSeeds(CFG.count);

  const posAttr = new InstancedBufferAttribute(positions, 3);
  const seedAttr = new InstancedBufferAttribute(seeds, 1);

  const uTime = uniform(0);

  // TSL nodes: base position + vertical floating
  const basePos = vec3(instancedBufferAttribute(posAttr));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TS can't infer itemSize=1 → float
  const seed = float(instancedBufferAttribute(seedAttr) as any);

  const floatOffset = sin(uTime.mul(CFG.floatSpeed).add(seed)).mul(CFG.floatAmplitude);
  const finalPos = basePos.add(vec3(float(0), floatOffset, float(0)));

  // Material
  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  // Circular particle shape
  const dist = uv().sub(0.5).length();
  const circle = smoothstep(0.5, 0.3, dist).mul(CFG.opacity);

  material.positionNode = finalPos;
  material.sizeNode = float(CFG.pointSize);
  material.colorNode = color(CFG.color);
  material.opacityNode = circle;

  // Instanced sprite
  const sprite = new Sprite(material);
  sprite.count = CFG.count;
  scene.add(sprite);

  function update(elapsed: number) {
    uTime.value = elapsed;
  }

  function dispose() {
    scene.remove(sprite);
    material.dispose();
  }

  return { update, dispose };
}
