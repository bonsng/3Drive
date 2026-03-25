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
  mix,
  sin,
  smoothstep,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import { LANDING } from '../constants';
import { fibonacciSphere } from '../utils/geometry';

const { sphere: CFG } = LANDING;

export function createParticleSphere(scene: Scene) {
  const spherePositions = fibonacciSphere(CFG.count, CFG.radius);
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
  const wave = sin(uTime.add(spherePos.x.mul(CFG.waveFrequency))).mul(CFG.waveAmplitude);
  const finalPos = morphed.add(vec3(wave, wave, float(0)));

  // Material
  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  // Circular particle shape
  const dist = uv().sub(0.5).length();
  const circle = smoothstep(0.5, 0.3, dist);

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
    sprite.rotation.y = elapsed * CFG.autoRotateSpeed;
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
