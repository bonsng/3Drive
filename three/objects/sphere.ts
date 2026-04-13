import {
  AdditiveBlending,
  InstancedBufferAttribute,
  PointsNodeMaterial,
  Scene,
  Sprite,
} from 'three/webgpu';
import {
  color,
  cos,
  float,
  instancedBufferAttribute,
  mix,
  sin,
  smoothstep,
  uniform,
  vec3,
} from 'three/tsl';
import { LANDING } from '../constants/landing';
import { fibonacciSphere } from '../utils/geometry';
import { circleMask } from '../utils/tsl';
import type { DragData } from '../effects/drag-trail';

const { sphere: SPHERE } = LANDING;

export interface ParticleSphereOptions {
  treePositions?: Float32Array;
  dragData?: DragData;
}

export function createParticleSphere(scene: Scene, options: ParticleSphereOptions = {}) {
  const { treePositions, dragData } = options;
  const spherePositions = fibonacciSphere(SPHERE.count, SPHERE.radius);

  const spherePosAttr = new InstancedBufferAttribute(spherePositions, 3);
  const treePosAttr = new InstancedBufferAttribute(
    treePositions ?? new Float32Array(SPHERE.count * 3),
    3,
  );

  // Drag attributes
  const dragGroupAttr = new InstancedBufferAttribute(
    dragData?.dragGroup ?? new Float32Array(SPHERE.count),
    1,
  );
  const dragTargetAttr = new InstancedBufferAttribute(
    dragData?.dragTarget ?? new Float32Array(SPHERE.count * 3),
    3,
  );

  // TSL uniforms
  const uMorphProgress = uniform(0);
  const uTime = uniform(0);
  const uPointerX = uniform(0); // NDC -1..1
  const uPointerY = uniform(0);
  const uDragProgress = uniform(0);

  // TSL nodes
  const spherePos = vec3(instancedBufferAttribute(spherePosAttr));
  const treePos = vec3(instancedBufferAttribute(treePosAttr));
  const dragGroup = float(instancedBufferAttribute(dragGroupAttr));
  const dragTargetPos = vec3(instancedBufferAttribute(dragTargetAttr));

  // 3단계 morph: 구체 → 중심 수렴 → 트리 폭발
  // morphProgress 0.0→0.4: collapseT (구체 → 원점)
  // morphProgress 0.4→0.45: 정지 (극적 멈춤)
  // morphProgress 0.45→1.0: expandT (원점 → 트리)
  const collapseT = smoothstep(float(0), float(0.4), uMorphProgress);
  const expandT = smoothstep(float(0.45), float(1.0), uMorphProgress);
  const collapsed = mix(spherePos, vec3(0, 0, 0), collapseT);
  const morphed = mix(collapsed, treePos, expandT);

  // Radial wave: 구체일 때만 적용 (트리 전개 시 fade out)
  const waveStrength = float(1).sub(collapseT);
  const wave = sin(uTime.add(spherePos.x.mul(SPHERE.waveFrequency)))
    .mul(SPHERE.waveAmplitude)
    .mul(waveStrength);
  const radialDir = morphed.normalize();
  const waved = morphed.add(radialDir.mul(wave));

  // Slow auto-rotation + mouse-driven rotation (트리 전개 시 fade out)
  const rotStrength = float(1).sub(expandT);
  const yAngle = uTime.mul(SPHERE.autoRotateSpeed).add(uPointerX.mul(SPHERE.mouseRotateX));
  const rawCy = cos(yAngle);
  const rawSy = sin(yAngle);
  // rotStrength가 0이면 회전 없음: cos→1, sin→0
  const cy = mix(float(1), rawCy, rotStrength);
  const sy = mix(float(0), rawSy, rotStrength);
  const rotY = vec3(
    waved.x.mul(cy).add(waved.z.mul(sy)),
    waved.y,
    waved.x.mul(sy).negate().add(waved.z.mul(cy)),
  );

  const xAngle = uPointerY.negate().mul(SPHERE.mouseRotateY);
  const rawCx = cos(xAngle);
  const rawSx = sin(xAngle);
  const cx = mix(float(1), rawCx, rotStrength);
  const sx = mix(float(0), rawSx, rotStrength);
  const rotatedPos = vec3(
    rotY.x,
    rotY.y.mul(cx).sub(rotY.z.mul(sx)),
    rotY.y.mul(sx).add(rotY.z.mul(cx)),
  );

  // Drag animation: dragGroup=1 파티클만 목표 위치로 이동
  // dragT = dragProgress * dragGroup (0 for non-drag particles)
  const dragT = uDragProgress.mul(dragGroup);
  // 수직 아크: sin(π·t)로 포물선 궤적
  const arcY = sin(dragT.mul(Math.PI)).mul(0.8);
  const dragDest = vec3(dragTargetPos.x, dragTargetPos.y.add(arcY), dragTargetPos.z);
  const finalPos = mix(rotatedPos, dragDest, dragT);

  // Drag 중인 파티클은 이동 중 글로우, 도착 시 해제 (sin 커브)
  const glowT = sin(dragT.mul(Math.PI));
  const sizeScale = float(1).add(glowT.mul(2.0));
  const glowColor = mix(color(SPHERE.color), color(0xccddff), glowT.mul(0.8));

  // Material
  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  material.positionNode = finalPos;
  material.sizeNode = float(SPHERE.pointSize).mul(sizeScale);
  material.colorNode = glowColor;
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
    uniforms: {
      morphProgress: uMorphProgress,
      dragProgress: uDragProgress,
      time: uTime,
      pointerX: uPointerX,
      pointerY: uPointerY,
    },
    dispose,
  };
}
