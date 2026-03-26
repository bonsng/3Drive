---
title: TSL 완전 정복 강의노트
date: 2026-03-24
tags:
  - three-js
  - webgpu
  - tsl
  - shader
  - 강의
---

# TSL 완전 정복 강의노트

> [!abstract] 강의 목표
> Three.js Shading Language(TSL)의 공식 스펙을 기반으로, GLSL/WGSL 없이 JavaScript만으로 셰이더를 작성하는 방법을 처음부터 끝까지 익힌다.

---

## 1강. TSL이란 무엇인가?

### 왜 TSL이 필요한가

기존 Three.js에서 커스텀 셰이더를 만들려면 `.onBeforeCompile()`로 GLSL 문자열을 직접 조작해야 했다. 이 방식은 유지보수가 끔찍하다.

**기존 방식 (onBeforeCompile)**
```javascript
const material = new THREE.MeshStandardMaterial();
material.map = colorMap;
material.onBeforeCompile = (shader) => {
    shader.uniforms.detailMap = { value: detailMap };

    let token = '#define STANDARD';
    let insert = `uniform sampler2D detailMap;`;
    shader.fragmentShader = shader.fragmentShader.replace(token, token + insert);

    token = '#include <map_fragment>';
    insert = `diffuseColor *= texture2D( detailMap, vMapUv * 10.0 );`;
    shader.fragmentShader = shader.fragmentShader.replace(token, token + insert);
};
```

**TSL 방식**
```javascript
import { texture, uv } from 'three/tsl';

const detail = texture(detailMap, uv().mul(10));

const material = new THREE.MeshStandardNodeMaterial();
material.colorNode = texture(colorMap).mul(detail);
```

> [!tip] 핵심 차이
> - GLSL 문자열 조작 → **JavaScript 함수 조합**
> - 렌더러 종속 → **렌더러 무관** (WebGPU/WebGL 자동 컴파일)
> - 모듈 간 충돌 → **Node 시스템이 자동으로 중복 제거**

### TSL의 장점 정리

| 장점 | 설명 |
|------|------|
| **통합 코드** | JS/TS로 셰이더 로직 작성, 문자열 조작 불필요 |
| **JS 생태계** | import/export, NPM, tree shaking 모두 사용 가능 |
| **타입 안정성** | TypeScript와 함께 사용하면 타입 체크 가능 |
| **선언적 접근** | "어떻게"가 아니라 "무엇을" 원하는지에 집중 |
| **자동 최적화** | 중복 계산 제거, varying 자동 생성, 폴리필 처리 |
| **렌더러 무관** | WGSL과 GLSL 모두로 자동 컴파일 |

### 아키텍처

모든 TSL 컴포넌트는 `Node` 클래스를 확장한다. 빌드 과정은 3단계:

| 단계 | 역할 |
|------|------|
| `setup` | TSL로 커스텀 코드를 생성. 여러 노드를 사용하지만 출력은 항상 하나 |
| `analyze` | 캐시/변수 생성이 필요한지 분석하여 최적화 정보 수집 |
| `generate` | 각 노드에서 최종 셰이더 코드 문자열을 생성 |

`NodeBuilder`가 최종 코드를 생성하며, `WGSLNodeBuilder`(WebGPU)와 `GLSLNodeBuilder`(WebGL2)로 확장된다.

---

## 2강. 타입 시스템과 상수

### 상수와 명시적 변환

TSL의 입력 함수들은 **상수를 만들거나 타입을 변환**하는 데 사용된다.

| 함수 | 반환 타입 |
|------|-----------|
| `float(node\|number)` | `float` |
| `int(node\|number)` | `int` |
| `uint(node\|number)` | `uint` |
| `bool(node\|value)` | `boolean` |
| `color(node\|hex\|r,g,b)` | `color` |
| `vec2(node\|Vector2\|x,y)` | `vec2` |
| `vec3(node\|Vector3\|x,y,z)` | `vec3` |
| `vec4(node\|Vector4\|x,y,z,w)` | `vec4` |
| `mat3(...)` / `mat4(...)` | `mat3` / `mat4` |
| `ivec2~4`, `uvec2~4`, `bvec2~4` | 정수/부호없는정수/불리언 벡터 |

```javascript
import { color, vec2, positionWorld } from 'three/tsl';

// 상수 생성
material.colorNode = color(0x0066ff);

// 타입 변환 (vec3 → vec2: xy만 추출)
material.colorNode = vec2(positionWorld); // positionWorld.xy
```

> [!info] 자동 변환
> 출력과 입력의 타입이 다르면 TSL이 자동으로 변환해준다.

### 메서드 체이닝으로 변환

```javascript
import { positionWorld } from 'three/tsl';

material.colorNode = positionWorld.toVec2(); // positionWorld.xy
```

`.toFloat()`, `.toInt()`, `.toVec3()`, `.toColor()` 등 모든 타입으로 변환 가능.

### Swizzle

GLSL의 swizzle과 동일하게 벡터 컴포넌트를 접근/재배열할 수 있다.

```javascript
const original = vec3(1.0, 2.0, 3.0);
const swizzled = original.zyx; // (3.0, 2.0, 1.0)
```

`xyzw`, `rgba`, `stpq` 모두 사용 가능.

---

## 3강. Uniform과 변수

### Uniform

GPU 관점에서의 진짜 변수. 셰이더를 다시 만들지 않고도 값을 업데이트할 수 있다.

```javascript
const myColor = uniform(new THREE.Color(0x0066FF));
material.colorNode = myColor;

// 나중에 값 변경
myColor.value.set(0xff0000);
```

### Uniform 자동 업데이트

| 메서드 | 호출 시점 |
|--------|-----------|
| `.onObjectUpdate(fn)` | 해당 노드를 가진 Material의 Mesh가 렌더링될 때마다 |
| `.onRenderUpdate(fn)` | 렌더 호출당 1번 (fog, tone mapping 등 공용) |
| `.onFrameUpdate(fn)` | 프레임당 1번 (time 같은 값에 적합) |

```javascript
const posY = uniform(0);
posY.onObjectUpdate(({ object }) => object.position.y);
material.colorNode = posY;
```

### 변수 선언

| 함수 | 용도 |
|------|------|
| `.toVar()` / `Var()` | 재사용 가능한 변수로 변환 |
| `.toConst()` / `Const()` | 인라인 상수로 변환 |
| `property(type, name)` | 초기값 없이 속성만 선언 |

```javascript
const uvScaled = uv().mul(10).toVar();
material.colorNode = texture(map, uvScaled);
```

---

## 4강. 연산자와 수학 함수

### 연산자

TSL은 메서드 체이닝으로 연산한다.

| 메서드 | 의미 |
|--------|------|
| `.add(v)` | 덧셈 |
| `.sub(v)` | 뺄셈 |
| `.mul(v)` | 곱셈 |
| `.div(v)` | 나눗셈 |
| `.mod(v)` | 나머지 |
| `.equal(v)` | `==` |
| `.greaterThan(v)` | `>` |
| `.lessThan(v)` | `<` |
| `.and(v)` / `.or(v)` / `.not()` | 논리 연산 |
| `.assign(v)` | 대입 |
| `.addAssign(v)` | `+=` |

```javascript
const a = float(1);
const b = float(2);
const result = a.add(b); // 3
```

### 주요 수학 함수

GLSL에서 익숙한 함수들이 거의 그대로 있다.

| 함수 | 설명 |
|------|------|
| `abs(x)` | 절대값 |
| `sin(x)` / `cos(x)` / `tan(x)` | 삼각함수 |
| `floor(x)` / `ceil(x)` / `round(x)` | 올림/내림/반올림 |
| `clamp(x, min, max)` | 범위 제한 |
| `saturate(x)` | 0~1 사이로 제한 |
| `mix(x, y, a)` | 선형 보간 |
| `smoothstep(e0, e1, x)` | Hermite 보간 |
| `step(edge, x)` | 계단 함수 |
| `normalize(x)` | 단위 벡터 |
| `dot(x, y)` / `cross(x, y)` | 내적/외적 |
| `reflect(I, N)` / `refract(I, N, eta)` | 반사/굴절 |
| `fract(x)` | 소수 부분 |
| `pow(x, y)` | 거듭제곱 |
| `distance(x, y)` / `length(x)` | 거리/길이 |
| `dFdx(p)` / `dFdy(p)` | 편미분 |

```javascript
const value = float(-1);
const positiveValue = abs(value); // 1

// 메서드 체이닝으로도 사용 가능
const positiveValue2 = value.abs(); // 1
```

### 메서드 체이닝 활용

```javascript
// 텍스처 색상 반전
material.colorNode = texture(map).rgb.oneMinus();

// 대비와 밝기 조절
const contrast = 0.5;
const brightness = 0.5;
material.colorNode = texture(map).mul(contrast).add(brightness);
```

---

## 5강. 함수와 제어 흐름

### Fn() — TSL 함수 만들기

`Fn()`은 제어 가능한 환경을 만들어 `assign`, 조건문 등을 사용할 수 있게 한다.

```javascript
// TSL 함수 (Fn) — assign, 조건문 사용 가능
const oscSine = Fn(([t = time]) => {
    return t.add(0.75).mul(Math.PI * 2).sin().mul(0.5).add(0.5);
});

// 인라인 함수 — 간단한 표현식에 적합
export const oscSine = (t = time) => t.add(0.75).mul(Math.PI * 2).sin().mul(0.5).add(0.5);
```

**객체 파라미터 지원:**
```javascript
const col = Fn(({ r, g, b }) => {
    return vec3(r, g, b);
});

material.colorNode = col(0, 1, 0);              // 배열식
material.colorNode = col({ r: 0, g: 1, b: 0 }); // 객체식
```

**Tree shaking 호환 export:**
```javascript
export const oscSawtooth = /*@__PURE__*/ Fn(([timer = time]) => timer.fract());
```

**NodeBuilder 접근 (material, geometry, object 등):**
```javascript
const customColor = Fn(({ material, geometry, object }) => {
    if (material.userData.customColor !== undefined) {
        return uniform(material.userData.customColor);
    }
    return vec3(0);
});

material.colorNode = customColor();
```

> [!note] Fn의 두 번째 파라미터
> `Fn`의 콜백에서 두 번째 파라미터로 `NodeBuilder`에 접근할 수 있다. `material`, `geometry`, `object`, `camera` 등 셰이더 빌드 시점의 정보를 얻을 수 있다.

### 조건문 — If / ElseIf / Else

> [!warning] 주의
> `If`의 I는 **대문자**다! `Fn()` 내부에서만 사용 가능.

```javascript
const limitPosition = Fn(({ position }) => {
    const limit = 10;
    const result = vec3(position);

    If(result.y.greaterThan(limit), () => {
        result.y = limit;
    }).ElseIf(result.y.lessThan(-limit), () => {
        result.y = -limit;
    }).Else(() => {
        // 그대로 유지
    });

    return result;
});

material.positionNode = limitPosition({ position: positionLocal });
```

### Switch-Case

```javascript
const col = color();

Switch(0)
    .Case(0, () => { col.assign(color(1, 0, 0)); })
    .Case(1, () => { col.assign(color(0, 1, 0)); })
    .Case(2, 3, () => { col.assign(color(0, 0, 1)); }) // 복수 값 가능
    .Default(() => { col.assign(color(1, 1, 1)); });
```

> [!info] GLSL과의 차이
> - **fallthrough 없음** — 각 Case에 암묵적 break
> - 하나의 Case에 **여러 값(selector)** 지정 가능

### 삼항 연산 (select)

`Fn()` 바깥에서도 사용 가능한 조건 표현식.

```javascript
// value > 1 ? 1.0 : value
const result = select(value.greaterThan(1), 1.0, value);
```

### 반복문 (Loop)

```javascript
// 기본
Loop(count, ({ i }) => { /* ... */ });

// 범위 지정
Loop({ start: int(0), end: int(10), type: 'int', condition: '<' }, ({ i }) => {});

// 중첩 루프 (간결 문법)
Loop(10, 5, ({ i, j }) => {});

// 역방향
Loop({ start: 10 }, () => {});

// while 스타일
const value = float(0);
Loop(value.lessThan(10), () => {
    value.addAssign(1);
});
```

`Break()`과 `Continue()`로 루프 제어 가능.

### Flow Control

| 함수 | 용도 |
|------|------|
| `Discard()` | 현재 프래그먼트 버리기 |
| `Return()` | 함수에서 반환 |
| `Break()` | 루프 탈출 |
| `Continue()` | 다음 반복으로 건너뛰기 |

```javascript
const customFragment = Fn(() => {
    If(uv().x.lessThan(0.5), () => {
        Discard(); // UV의 왼쪽 절반은 버림
    });
    return vec4(1, 0, 0, 1);
});

material.colorNode = customFragment();
```

---

## 6강. 텍스처와 어트리뷰트

### 텍스처 함수

| 함수 | 설명 | 반환 |
|------|------|------|
| `texture(tex, uv, level)` | 텍스처 샘플링 (보간 있음) | `vec4` |
| `textureLoad(tex, uv, level)` | 보간 없이 텍셀 직접 읽기 | `vec4` |
| `textureStore(tex, uv, value)` | storage 텍스처에 값 쓰기 | `void` |
| `textureSize(tex, level)` | 텍스처 크기 | `ivec2` |
| `textureBicubic(texNode, strength)` | 밉맵 바이큐빅 필터링 | `vec4` |
| `cubeTexture(tex, uvw, level)` | 큐브맵 샘플링 | `vec4` |
| `texture3D(tex, uvw, level)` | 3D 텍스처 | `vec4` |
| `triplanarTexture(...)` | 트리플래너 매핑 | `vec4` |

### 어트리뷰트

| 노드 | 설명 | 타입 |
|------|------|------|
| `attribute(name, type)` | 이름으로 geometry 어트리뷰트 접근 | `any` |
| `uv(index)` | UV 좌표 | `vec2` |
| `vertexColor(index)` | 정점 색상 | `color` |
| `instanceIndex` | 인스턴스 인덱스 | `uint` |
| `vertexIndex` | 정점 인덱스 | `uint` |

---

## 7강. 공간 좌표계 노드

### Position (위치)

| 노드 | 공간 | 타입 |
|------|------|------|
| `positionGeometry` | 원본 geometry 어트리뷰트 | `vec3` |
| `positionLocal` | 변환된 로컬 (스키닝, 모핑 적용 후) | `vec3` |
| `positionWorld` | 월드 좌표 | `vec3` |
| `positionView` | 뷰 좌표 | `vec3` |
| `positionWorldDirection` | 정규화된 월드 방향 | `vec3` |
| `positionViewDirection` | 정규화된 뷰 방향 | `vec3` |

### Normal (법선)

| 노드 | 공간 | 타입 |
|------|------|------|
| `normalGeometry` | 원본 geometry | `vec3` |
| `normalLocal` | 로컬 | `vec3` |
| `normalView` | 정규화된 뷰 (면 방향 보정 포함) | `vec3` |
| `normalWorld` | 정규화된 월드 (면 방향 보정 포함) | `vec3` |

### Tangent / Bitangent

각각 `tangentGeometry/Local/View/World`, `bitangentGeometry/Local/View/World` 제공.

### Camera

| 노드 | 설명 | 타입 |
|------|------|------|
| `cameraNear` / `cameraFar` | 카메라 near/far | `float` |
| `cameraPosition` | 카메라 월드 위치 | `vec3` |
| `cameraProjectionMatrix` | 프로젝션 행렬 | `mat4` |
| `cameraViewMatrix` | 뷰 행렬 | `mat4` |

### Model

| 노드 | 설명 | 타입 |
|------|------|------|
| `modelWorldMatrix` | 월드 행렬 | `mat4` |
| `modelViewMatrix` | 뷰 공간 행렬 | `mat4` |
| `modelPosition` | 모델 위치 | `vec3` |
| `modelScale` | 모델 스케일 | `vec3` |

### Screen / Viewport

| 노드 | 설명 | 타입 |
|------|------|------|
| `screenUV` | 정규화된 프레임버퍼 좌표 | `vec2` |
| `screenCoordinate` | 물리 픽셀 단위 좌표 | `vec2` |
| `screenSize` | 물리 픽셀 단위 크기 | `vec2` |
| `viewportUV` | 정규화된 뷰포트 좌표 | `vec2` |
| `viewportSharedTexture(uv)` | 이미 렌더링된 결과에 접근 (굴절 등) | `vec4` |
| `viewportLinearDepth` | 선형 깊이값 | `float` |

---

## 8강. Varying과 최적화

### vertexStage()

fragment stage에서 사용하는 계산을 vertex stage로 옮겨 최적화할 수 있다.

```javascript
// modelNormalMatrix.mul(normalLocal)은 vertex stage에서 실행
const normalView = vertexStage(modelNormalMatrix.mul(normalLocal));

// normalize만 fragment stage에서 실행
material.colorNode = normalView.normalize();
```

> [!tip] 최적화 포인트
> `vertexStage()`의 결과는 자동으로 varying이 되어 fragment stage로 보간 전달된다. 무거운 계산은 vertex stage로 옮기면 픽셀당 → 정점당으로 비용이 줄어든다.

### Array

```javascript
// 상수 배열
const colors = array([
    vec3(1, 0, 0),
    vec3(0, 1, 0),
    vec3(0, 0, 1)
]);
const greenColor = colors.element(1);

// Uniform 배열 (동적으로 값 변경 가능)
const tintColors = uniformArray([
    new Color(1, 0, 0),
    new Color(0, 1, 0),
    new Color(0, 0, 1)
], 'color');
const redColor = tintColors.element(0);
```

> [!info] element() vs 대괄호
> - `a[1]` — 상수 인덱스만 가능
> - `a.element(1)` — 동적 인덱스(노드) 사용 가능

---

## 9강. 유틸리티 노드

### Oscillator (진동)

| 함수 | 파형 |
|------|------|
| `oscSine(timer)` | 사인파 |
| `oscSquare(timer)` | 사각파 |
| `oscTriangle(timer)` | 삼각파 |
| `oscSawtooth(timer)` | 톱니파 |

### Timer

- `time` — 경과 시간 (초)
- `deltaTime` — 프레임 간 시간 차이 (초)

### Random

- `hash(seed)` — 시드 기반 해시 (0~1)
- `range(min, max)` — 인스턴스별 랜덤 어트리뷰트

### Blend Modes

`blendBurn`, `blendDodge`, `blendOverlay`, `blendScreen`, `blendColor`

### Color Adjustments

```javascript
// 채도 높이기
material.colorNode = saturation(texture(map), 1.5);

// 색상 회전 (90도)
material.colorNode = hue(texture(map), Math.PI / 2);

// 포스터라이즈 (4단계)
material.colorNode = posterize(texture(map), 4);
```

### UV Utils

| 함수 | 설명 |
|------|------|
| `matcapUV` | Matcap 텍스처용 UV |
| `rotateUV(uv, rotation, center)` | UV 회전 |
| `spherizeUV(uv, strength, center)` | 구면 왜곡 |
| `spritesheetUV(count, uv, frame)` | 스프라이트 시트 UV 계산 |
| `equirectUV(direction)` | Equirectangular 매핑 |

### 기타 유틸리티

```javascript
// 빌보딩 — 항상 카메라를 향함
material.vertexNode = billboarding(); // 수평만 (나무 등)
material.vertexNode = billboarding({ horizontal: true, vertical: true }); // 전방향 (파티클)

// 체커보드 패턴
const pattern = checker(uv().mul(10));
```

### Fog

```javascript
// 선형 안개
scene.fogNode = fog(color(0x000000), rangeFogFactor(10, 100));

// 지수 안개
scene.fogNode = fog(color(0xcccccc), densityFogFactor(0.02));
```

---

## 10강. NodeMaterial 입력 슬롯

### Core (모든 NodeMaterial 공통)

| 슬롯 | 용도 | 타입 |
|------|------|------|
| `.fragmentNode` | fragment stage 전체를 대체 | `vec4` |
| `.vertexNode` | vertex stage 전체를 대체 | `vec4` |
| `.geometryNode` | geometry 처리용 TSL 함수 | `Fn()` |

### Basic (기본)

| 슬롯 | 대체하는 것 | 타입 |
|------|-------------|------|
| `.colorNode` | `color * map` | `vec4` |
| `.opacityNode` | `opacity * alphaMap` | `float` |
| `.alphaTestNode` | 알파 테스트 임계값 | `float` |
| `.positionNode` | `displacementMap` 로직 | `vec3` |
| `.depthNode` | 깊이 출력 | `float` |

### Lighting (조명)

| 슬롯 | 대체하는 것 | 타입 |
|------|-------------|------|
| `.emissiveNode` | `emissive * emissiveIntensity * emissiveMap` | `color` |
| `.normalNode` | `normalMap * normalScale` / `bumpMap` | `vec3` |
| `.lightsNode` | 라이팅 모델 | `lights()` |
| `.envNode` | `envMap` 로직 | `color` |

### MeshStandardNodeMaterial

| 슬롯 | 대체하는 것 | 타입 |
|------|-------------|------|
| `.metalnessNode` | `metalness * metalnessMap` | `float` |
| `.roughnessNode` | `roughness * roughnessMap` | `float` |

### MeshPhysicalNodeMaterial (추가 슬롯)

| 슬롯 | 타입 |
|------|------|
| `.clearcoatNode` / `.clearcoatRoughnessNode` / `.clearcoatNormalNode` | `float` / `float` / `vec3` |
| `.sheenNode` | `color` |
| `.iridescenceNode` / `.iridescenceIORNode` / `.iridescenceThicknessNode` | `float` |
| `.transmissionNode` / `.thicknessNode` | `color` / `float` |
| `.iorNode` | `float` |
| `.anisotropyNode` | `vec2` |
| `.dispersionNode` | `float` |

### Shadow 관련

| 슬롯 | 용도 | 타입 |
|------|------|------|
| `.castShadowNode` | 투사되는 그림자의 색상/투명도 | `vec4` |
| `.maskShadowNode` | 커스텀 그림자 마스크 | `bool` |
| `.receivedShadowNode` | 받는 그림자 처리 | `Fn()` |
| `.aoNode` | 앰비언트 오클루전 | `float` |

### Output 관련

| 슬롯 | 용도 | 타입 |
|------|------|------|
| `.maskNode` | 렌더링 초기에 버리는 마스크 (opacity보다 성능 좋음) | `bool` |
| `.outputNode` | 최종 출력 | `vec4` |
| `.mrtNode` | pass()와 다른 MRT 정의 | `mrt()` |

---

## 11강. Render Pipeline과 포스트 프로세싱

### 기본 구조

```javascript
import * as THREE from 'three/webgpu';
import { pass } from 'three/tsl';

const renderPipeline = new THREE.RenderPipeline(renderer);
const scenePass = pass(scene, camera);
renderPipeline.outputNode = scenePass;

function animate() {
    renderPipeline.render();
}
```

### Multiple Render Targets (MRT)

한 번의 드로우 콜로 색상, 노멀, 깊이, 속도 등을 동시에 캡처한다.

```javascript
import { pass, mrt, output, normalView, velocity, directionToColor } from 'three/tsl';

const scenePass = pass(scene, camera);

scenePass.setMRT(mrt({
    output: output,
    normal: directionToColor(normalView),
    velocity: velocity
}));

// 각 버퍼를 텍스처 노드로 접근
const colorTexture = scenePass.getTextureNode('output');
const normalTexture = scenePass.getTextureNode('normal');
const depthTexture = scenePass.getTextureNode('depth'); // depth는 항상 사용 가능
```

### 포스트 프로세싱 이펙트

TSL의 포스트 프로세싱 함수들은 **머티리얼에서도 포스트에서도** 사용 가능하다.

| 함수 | 효과 |
|------|------|
| `bloom(node, strength, radius, threshold)` | 블룸 |
| `gaussianBlur(node, direction, sigma)` | 가우시안 블러 |
| `fxaa(node)` / `smaa(node)` / `traa(...)` | 안티앨리어싱 |
| `dof(node, viewZ, focusDist, focalLen, bokeh)` | 피사계 심도 |
| `motionBlur(input, velocity, samples)` | 모션 블러 |
| `chromaticAberration(node, strength)` | 색수차 |
| `ssr(color, depth, normal, metalness, roughness)` | 스크린 스페이스 반사 |
| `ssgi(beauty, depth, normal)` | 스크린 스페이스 GI |
| `ao(depth, normal, camera)` | GTAO |
| `outline(scene, camera, params)` | 아웃라인 |
| `film(input)` | 필름 그레인 |
| `sepia(color)` / `grayscale(color)` | 색조 변환 |
| `sobel(node)` | 엣지 검출 |
| `dotScreen(node, angle, scale)` | 도트 스크린 |

```javascript
import { grayscale, pass } from 'three/tsl';
import { gaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js';

const scenePass = pass(scene, camera);
const output = scenePass.getTextureNode();

renderPipeline.outputNode = grayscale(gaussianBlur(output, 4));
```

---

## 12강. Compute Shader

TSL로 GPU 범용 계산을 수행할 수 있다.

```javascript
import { Fn, instancedArray, instanceIndex, deltaTime } from 'three/tsl';

const count = 1000;
const positionArray = instancedArray(count, 'vec3');

const computeShader = Fn(() => {
    const position = positionArray.element(instanceIndex);
    position.x.addAssign(deltaTime);
})().compute(count);

// 실행
renderer.compute(computeShader);
```

### Compute 관련 노드

| 노드 | 설명 |
|------|------|
| `workgroupId` | 워크그룹 ID |
| `localId` | 워크그룹 내 로컬 ID |
| `globalId` | 전역 호출 ID |
| `numWorkgroups` | 워크그룹 수 |
| `subgroupSize` | 서브그룹 크기 |

### Atomic 연산

`atomicAdd`, `atomicSub`, `atomicMax`, `atomicMin`, `atomicAnd`, `atomicOr`, `atomicXor`, `atomicStore`, `atomicLoad`

### 배리어

`workgroupBarrier()`, `storageBarrier()`, `textureBarrier()`, `barrier()`

### Struct

```javascript
const BoundingBox = struct({ min: 'vec3', max: 'vec3' });

const bb = BoundingBox(vec3(0), vec3(1));
const min = bb.get('min');
min.assign(vec3(-1, -1, -1));
```

---

## 부록. GLSL → TSL 변환표

| GLSL | TSL | 타입 |
|------|-----|------|
| `position` | `positionGeometry` | `vec3` |
| `transformed` | `positionLocal` | `vec3` |
| `transformedNormal` | `normalLocal` | `vec3` |
| `vWorldPosition` | `positionWorld` | `vec3` |
| `vColor` | `vertexColor()` | `vec3` |
| `vUv` / `uv` | `uv()` | `vec2` |
| `vNormal` | `normalView` | `vec3` |
| `viewMatrix` | `cameraViewMatrix` | `mat4` |
| `modelMatrix` | `modelWorldMatrix` | `mat4` |
| `modelViewMatrix` | `modelViewMatrix` | `mat4` |
| `projectionMatrix` | `cameraProjectionMatrix` | `mat4` |
| `diffuseColor` | `material.colorNode` | `vec4` |
| `gl_FragColor` | `material.fragmentNode` | `vec4` |

---

> [!abstract] 정리
> TSL은 **JavaScript로 셰이더를 작성하는 노드 기반 추상화**다. GLSL의 거의 모든 기능을 커버하면서도 JS 생태계의 이점(모듈, 타입 체크, tree shaking)을 그대로 가져온다. 렌더러가 자동으로 WGSL/GLSL을 생성하므로, 개발자는 **의도(what)**에만 집중하면 된다.

> [!tip] 원본 출처
> [Three.js Shading Language — 공식 Wiki](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)
