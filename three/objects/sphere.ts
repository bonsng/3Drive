import {
  AdditiveBlending,
  InstancedBufferAttribute,
  PointsNodeMaterial,
  Scene,
  Sprite,
} from 'three/webgpu';
import { color, cos, float, instancedBufferAttribute, mix, sin, uniform, vec3 } from 'three/tsl';
import { LANDING } from '../constants';
import { fibonacciSphere } from '../utils/geometry';
import { circleMask } from '../utils/tsl';

const { sphere: SPHERE } = LANDING;

export function createParticleSphere(scene: Scene) {
  const spherePositions = fibonacciSphere(SPHERE.count, SPHERE.radius);
  const clusterPositions = new Float32Array(spherePositions); // Phase 1: spherePos 복사본

  const spherePosAttr = new InstancedBufferAttribute(spherePositions, 3);
  const clusterPosAttr = new InstancedBufferAttribute(clusterPositions, 3);

  // TSL uniforms
  const uMorphProgress = uniform(0);
  const uTime = uniform(0);

  // TSL nodes: morph + wave
  const spherePos = vec3(instancedBufferAttribute(spherePosAttr));
  const clusterPos = vec3(instancedBufferAttribute(clusterPosAttr));

  const morphed = mix(spherePos, clusterPos, uMorphProgress);

  // Radial wave: 구체 표면을 따라 숨쉬듯 팽창/수축
  const wave = sin(uTime.add(spherePos.x.mul(SPHERE.waveFrequency))).mul(SPHERE.waveAmplitude);
  const radialDir = morphed.normalize();
  const waved = morphed.add(radialDir.mul(wave));

  // Y-axis rotation in TSL (CPU rotation 제거)
  const angle = uTime.mul(SPHERE.autoRotateSpeed);
  const c = cos(angle);
  const s = sin(angle);
  const finalPos = vec3(
    waved.x.mul(c).add(waved.z.mul(s)),
    waved.y,
    waved.x.mul(s).negate().add(waved.z.mul(c)),
  );

  // Material
  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  material.positionNode = finalPos;
  material.sizeNode = float(SPHERE.pointSize);
  material.colorNode = color(SPHERE.color);
  material.opacityNode = circleMask();

  // Instanced sprite
  const sprite = new Sprite(material);
  sprite.count = SPHERE.count;
  scene.add(sprite);

  function update(elapsed: number) {
    uTime.value = elapsed;
  }

  function dispose() {
    scene.remove(sprite);
    material.dispose();
  }

  return {
    update,
    uniforms: { morphProgress: uMorphProgress, time: uTime },
    dispose,
  };
}
