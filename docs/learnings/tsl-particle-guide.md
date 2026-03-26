---
title: TSL 파티클 시스템 구현 가이드
date: 2026-03-25
tags:
  - three-js
  - webgpu
  - tsl
  - particle
---

# TSL 파티클 시스템 구현 가이드

> GLSL 경험자를 위한 TSL + WebGPU 파티클 구현 해설.
> `three/objects/sphere.ts`, `three/objects/particles.ts` 기반.

---

## 1. WebGPU 파티클 렌더링: Sprite 인스턴싱

WebGPU에서는 `gl_PointSize`가 없어서 `Points` 오브젝트는 항상 1px로 렌더링된다.

대안: **Sprite 인스턴싱** 패턴.

```typescript
const sprite = new Sprite(material);
sprite.count = 2000; // 같은 빌보드 쿼드를 2000번 인스턴싱
```

- `Sprite` = 빌보드 쿼드 1장
- `.count` = 인스턴스 수 (WebGPU 전용)
- GPU가 **1회 draw call**로 전부 그림
- 각 인스턴스의 위치는 `InstancedBufferAttribute`로 전달

GLSL로 치면 `gl_InstanceID`로 per-instance 데이터를 읽는 것과 같다.

---

## 2. TSL 기초: JS로 쓰는 셰이더

TSL(Three.js Shading Language)은 GLSL 문자열 대신 **JS 함수 호출로 셰이더 노드 그래프를 구성**한다. Three.js가 빌드 타임에 WGSL(WebGPU) 또는 GLSL(WebGL fallback)로 자동 컴파일한다.

### 2.1 Uniform

```typescript
// TSL
const uTime = uniform(0);
uTime.value = elapsed; // JS에서 매 프레임 업데이트
```

```glsl
// GLSL 동치
uniform float uTime;
```

### 2.2 Instanced Attribute 읽기

```typescript
// TSL — CPU에서 데이터 준비
const spherePosAttr = new InstancedBufferAttribute(positions, 3);

// TSL — 셰이더에서 읽기
const spherePos = vec3(instancedBufferAttribute(spherePosAttr));
```

```glsl
// GLSL 동치
attribute vec3 spherePos; // per-instance
```

`instancedBufferAttribute()`는 내부적으로 인스턴스 인덱스(`instance_index` in WGSL, `gl_InstanceID` in GLSL)를 사용해 각 인스턴스의 데이터를 읽는다.

> **참고**: `vec3()`로 감싸는 이유는 TypeScript 타입 추론 문제 때문이다. 런타임에는 영향 없음.

### 2.3 연산 = 메서드 체이닝

```typescript
// TSL
const morphed = mix(spherePos, clusterPos, uMorphProgress);
const wave = sin(uTime.add(spherePos.x.mul(10))).mul(0.02);
const finalPos = morphed.add(vec3(wave, wave, float(0)));
```

```glsl
// GLSL 동치
vec3 morphed = mix(spherePos, clusterPos, uMorphProgress);
float wave = sin(uTime + spherePos.x * 10.0) * 0.02;
vec3 finalPos = morphed + vec3(wave, wave, 0.0);
```

| GLSL 연산자 | TSL 메서드 |
|------------|-----------|
| `a + b` | `a.add(b)` |
| `a - b` | `a.sub(b)` |
| `a * b` | `a.mul(b)` |
| `a / b` | `a.div(b)` |

`mix`, `sin`, `smoothstep` 등 내장 함수명은 GLSL과 거의 동일하다.

### 2.4 Material 슬롯 = 셰이더 출력 연결

```typescript
material.positionNode = finalPos;      // vertex: 위치 결정
material.sizeNode = float(0.04);       // vertex: 스프라이트 크기 (월드 단위)
material.colorNode = color(0x6688ff);  // fragment: 색상
material.opacityNode = circle;         // fragment: 알파
```

GLSL 대응:

```glsl
// vertex shader
gl_Position = projectionMatrix * viewMatrix * vec4(finalPos, 1.0);

// fragment shader
gl_FragColor = vec4(0.4, 0.53, 1.0, circle);
```

`NodeMaterial`이 슬롯들을 조합해서 전체 셰이더를 자동 생성한다. GLSL처럼 vertex/fragment를 직접 작성할 필요 없음.

---

## 3. 원형 파티클 (Fragment 단계)

스프라이트 쿼드는 기본적으로 사각형이다. UV를 이용해 원형 마스크를 만든다.

```typescript
// TSL
const dist = uv().sub(0.5).length();       // UV 중심(0.5, 0.5)에서의 거리
const circle = smoothstep(0.5, 0.3, dist); // 0.3~0.5 구간에서 부드럽게 페이드
material.opacityNode = circle;
```

```glsl
// GLSL 동치
float dist = length(vUv - 0.5);
float circle = smoothstep(0.5, 0.3, dist);
gl_FragColor.a = circle;
```

결과: 원 안쪽은 불투명, 가장자리는 부드럽게 페이드아웃, 바깥은 투명.

---

## 4. Per-Instance 랜덤 애니메이션 (particles.ts)

각 파티클이 서로 다른 타이밍으로 움직이려면 per-instance seed가 필요하다.

```typescript
// CPU: 랜덤 위상 생성
const seeds = new Float32Array(count);
for (let i = 0; i < count; i++) seeds[i] = Math.random() * Math.PI * 2;
const seedAttr = new InstancedBufferAttribute(seeds, 1);

// GPU: seed를 이용한 개별 진동
const seed = float(instancedBufferAttribute(seedAttr));
const floatOffset = sin(uTime.mul(0.3).add(seed)).mul(0.5);
const finalPos = basePos.add(vec3(float(0), floatOffset, float(0)));
```

```glsl
// GLSL 동치
attribute float seed; // per-instance
float floatOffset = sin(uTime * 0.3 + seed) * 0.5;
vec3 finalPos = basePos + vec3(0.0, floatOffset, 0.0);
```

모든 파티클이 같은 `sin()` 함수를 쓰지만, seed가 다르므로 각자 다른 위상에서 Y축 진동한다.

---

## 5. 전체 흐름 요약

```
CPU (JS)                          GPU (TSL → WGSL/GLSL)
─────────────────────────────     ──────────────────────────────
InstancedBufferAttribute 생성  →  instancedBufferAttribute()로 읽기
uniform() 생성                →  셰이더 내에서 값 참조
매 프레임 uniform.value 갱신  →  mix/sin/smoothstep 등 연산
                                  ↓
                                  material.positionNode  → vertex 위치
                                  material.sizeNode      → 스프라이트 크기
                                  material.colorNode     → fragment 색상
                                  material.opacityNode   → fragment 알파
```

---

## 6. WebGPU vs WebGL 주의사항

| 항목 | WebGPU | WebGL fallback |
|------|--------|----------------|
| Point size | 항상 1px (`Points` 사용 불가) | `gl_PointSize` 동작 |
| 파티클 방법 | `Sprite` + `.count` 인스턴싱 | `Points` + `BufferGeometry` 가능 |
| 셰이더 언어 | WGSL (TSL이 자동 생성) | GLSL (TSL이 자동 생성) |
| Pixel ratio | 높으면 fill rate 병목 주의 | 상대적으로 관대 |
| 초기화 | `renderer.init()` async | 동기 |

> 이 프로젝트에서는 `MAX_PIXEL_RATIO = 1.5`로 제한해 WebGPU fill rate 병목을 방지한다.
