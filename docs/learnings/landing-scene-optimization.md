# Landing Scene Optimization

랜딩 씬 파티클 시스템의 성능 병목 분석 및 최적화 기록.

## 분석 대상

- Particle Sphere: 2000개 (Fibonacci 분포)
- Ambient Particles: 100개 (랜덤 큐브 분포)
- 렌더러: WebGPURenderer, Additive blending, depth write off

## 최적화 항목

### 1. Sphere Y축 회전 — CPU → TSL 이동

**Before**: 매 프레임 CPU에서 `sprite.rotation.y` 설정 → Object3D matrix 재계산

```ts
sprite.rotation.y = elapsed * CFG.autoRotateSpeed;
```

**After**: TSL에서 Y축 회전 행렬을 직접 적용, CPU 동기 포인트 제거

```ts
const angle = uTime.mul(SPHERE.autoRotateSpeed);
const c = cos(angle);
const s = sin(angle);
const finalPos = vec3(
  waved.x.mul(c).add(waved.z.mul(s)),
  waved.y,
  waved.x.mul(s).negate().add(waved.z.mul(c)),
);
```

**효과**: CPU↔GPU 동기 포인트 1개 제거. 현재 규모에서는 미세하지만, 파티클 수 증가 시 Object3D matrix 업데이트 비용 회피.

### 2. Wave 방향 — 대각선 → 방사(radial) 방향

**Before**: x, y에 동일한 wave 적용 → 대각선 방향으로만 움직임

```ts
const finalPos = morphed.add(vec3(wave, wave, float(0)));
```

**After**: 구체 표면의 방사 방향으로 wave 적용 → 숨쉬듯 팽창/수축

```ts
const radialDir = morphed.normalize();
const waved = morphed.add(radialDir.mul(wave));
```

**효과**: 시각적 개선. 연산량은 `normalize()` 추가로 미세 증가하지만 GPU에서 처리되므로 무시할 수준.

### 3. Ambient 파티클 Z 범위 축소

**Before**: `[-8, -1.5]` — 카메라(z=5)에서 최대 13 유닛 거리, 먼 파티클은 거의 보이지 않음

**After**: `[-4, -1.5]` — 최대 9 유닛 거리로 축소

**효과**: 보이지 않는 파티클의 불필요한 프래그먼트 셰이더 실행 감소. Frustum culling이 Points/Sprite에서 오브젝트 단위로만 동작하므로 개별 파티클은 걸러지지 않기 때문.

### 4. Circle mask 공유 유틸 추출

**Before**: sphere.ts, particles.ts 각각 동일한 smoothstep circle mask 코드 중복

```ts
const dist = uv().sub(0.5).length();
const circle = smoothstep(0.5, 0.3, dist);
```

**After**: `three/utils/tsl.ts`에 `circleMask()` 함수로 추출

```ts
export function circleMask(outer = 0.5, inner = 0.3) {
  const dist = uv().sub(0.5).length();
  return smoothstep(outer, inner, dist);
}
```

**효과**: 코드 중복 제거. 파티클 오브젝트 추가 시 재사용 가능. outer/inner 파라미터로 falloff 커스터마이즈 가능.

## 향후 고려사항

- **Phase 2+ 확장 시**: morphProgress 전환이 복잡해지면 cluster 위치 계산의 GPU 부하 모니터링 필요
- **GSAP ScrollTrigger 연동**: `landingSceneState` → uniform 동기 포인트가 Phase 4(drag, orbit)에서 늘어남. 필요시 uniform 배치 업데이트 고려
- **Additive blending overdraw**: 파티클 수가 수천~수만으로 증가하면 fill-rate 병목 가능. 해결: 파티클 크기 축소, LOD, 또는 compute shader 기반 파티클 시스템
- **Circle mask 대안**: 파티클 수 대폭 증가 시 smoothstep 대신 텍스처 기반 마스크나 discard 기반 알파 테스트가 더 효율적일 수 있음
