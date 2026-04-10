import {
  AdditiveBlending,
  InstancedBufferAttribute,
  PointsNodeMaterial,
  Scene,
  Sprite,
} from 'three/webgpu';
import { color, float, instancedBufferAttribute, sin, uniform, vec3 } from 'three/tsl';
import { LANDING } from '../constants/landing';
import { randomPositions, randomSeeds } from '../utils/geometry';
import { circleMask } from '../utils/tsl';

const { ambient: AMBIENT } = LANDING;

export function createAmbientParticles(scene: Scene) {
  const positions = randomPositions(AMBIENT.count, AMBIENT.spread, AMBIENT.zRange);
  const seeds = randomSeeds(AMBIENT.count);

  const posAttr = new InstancedBufferAttribute(positions, 3);
  const seedAttr = new InstancedBufferAttribute(seeds, 1);

  const uTime = uniform(0);

  // TSL nodes: base position + vertical floating
  const basePos = vec3(instancedBufferAttribute(posAttr));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TS can't infer itemSize=1 → float
  const seed = float(instancedBufferAttribute(seedAttr) as any);

  const floatOffset = sin(uTime.mul(AMBIENT.floatSpeed).add(seed)).mul(AMBIENT.floatAmplitude);
  const finalPos = basePos.add(vec3(float(0), floatOffset, float(0)));

  // Material
  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  material.positionNode = finalPos;
  material.sizeNode = float(AMBIENT.pointSize);
  material.colorNode = color(AMBIENT.color);
  material.opacityNode = circleMask().mul(AMBIENT.opacity);

  // Instanced sprite
  const sprite = new Sprite(material);
  sprite.count = AMBIENT.count;
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
