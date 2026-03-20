# 3Drive

3D 파일 탐색기 — 파일 시스템을 3D 공간에서 시각화하는 SPA.

## 기술 스택

- **프레임워크**: Vite + React 19 + TypeScript
- **3D**: Three.js (WebGPURenderer, WebGL fallback)
- **상태 관리**: Zustand (UI 상태 전용, Three.js 씬 내부 상태는 Three.js 자체 관리)
- **라우팅**: React Router v7
- **스타일링**: Tailwind CSS 4
- **애니메이션**: GSAP (카메라), Framer Motion (UI)
- **패키지 매니저**: bun

## 프로젝트 구조

```
src/
├── pages/          # 라우트 페이지 (HomePage, DrivePage)
├── three/          # Three.js 코어 (React 의존성 없음)
│   ├── engine.ts   # Scene, Camera, Renderer 초기화
│   ├── controls.ts # OrbitControls
│   ├── raycaster.ts# 클릭/호버/드래그 이벤트
│   ├── lights.ts   # 조명
│   └── objects/    # 3D 오브젝트 (file-node, trash-zone, loaders 등)
├── stores/         # Zustand 스토어 (modal-store, ui-store)
├── components/     # React UI (layout, modal, search, context-menu, ThreeCanvas)
├── lib/            # 순수 유틸리티 (기존 프로젝트에서 재활용)
├── hooks/          # 커스텀 훅
└── types/          # 타입 정의
```

## 핵심 아키텍처

- **React ↔ Three.js 분리**: `ThreeCanvas.tsx`가 브릿지 역할. Three.js 코드(`src/three/`)는 React 의존성 없이 순수 JS/TS로 작성.
- **3D 이벤트 → UI 연결**: Raycaster 이벤트에서 `useModalStore.getState()` / `useUiStore.getState()`로 Zustand 직접 호출.
- **WebGPU 비동기 초기화**: `renderer.init()`이 Promise 반환, async/await 처리 필수.
- **setAnimationLoop**: requestAnimationFrame 대신 `renderer.setAnimationLoop()` 사용.

## 개발 명령어

```bash
bun dev        # 개발 서버
bun run build  # 빌드 (tsc + vite build)
bun run lint   # ESLint
```

## 마이그레이션

- 상세 계획: `docs/migration-plan.md`
- TODO 체크리스트: `docs/migration-todo.md`
- 기존 프로젝트: Next.js 15 + React Three Fiber + React Context에서 전환 중

## 학습 기록

- `docs/learnings/` — 프로젝트 진행 중 생긴 궁금증과 답변을 주제별 파일로 기록

## 코드 컨벤션

- **LSP 우선 사용**: 타입 추론, 심볼 정의 추적, 참조 검색, 프로젝트 구조 파악 시 반드시 LSP 도구를 먼저 사용. Grep/Glob으로 텍스트 검색하기 전에 `goToDefinition`, `findReferences`, `hover`, `documentSymbol` 등을 활용할 것.
- `@/*` path alias 사용 예정 (`src/` 매핑)
- Three.js import: `three/webgpu` (WebGPURenderer), `three/addons` (OrbitControls, GLTFLoader 등)
- Three.js 메모리 관리: geometry/material/texture는 반드시 `dispose()` 호출
- 모델 캐싱: GLTFLoader로 같은 모델 반복 로드하지 않도록 캐시 구현

---

## 핵심 원칙

- **Simplicity First**: 모든 변경은 최대한 단순하게. 최소한의 코드만 수정.
- **No Laziness**: 근본 원인을 찾아 해결. 임시 수정 금지. 시니어 개발자 기준.
- **Minimal Impact**: 필요한 부분만 수정. 새로운 버그를 유발하는 사이드 이펙트 금지.

## 작업 흐름

### 1. Plan Mode 기본 사용

- 3단계 이상 또는 아키텍처 결정이 필요한 작업은 반드시 plan mode 진입
- 문제가 발생하면 즉시 멈추고 재계획
- 검증 단계도 계획에 포함
- 모호함을 줄이기 위해 상세 스펙을 먼저 작성

### 2. Subagent 전략

- main context window를 깨끗하게 유지하기 위해 subagent 적극 활용
- 리서치, 탐색, 병렬 분석은 subagent에 위임
- 복잡한 문제는 subagent를 통해 더 많은 compute 투입
- subagent 하나당 하나의 작업에 집중

### 3. 자기 개선 루프

- 유저로부터 수정 지시를 받으면: `tasks/lessons.md`에 패턴 기록
- 같은 실수를 방지하는 규칙을 스스로 작성
- 실수율이 줄어들 때까지 반복 개선
- 세션 시작 시 관련 프로젝트의 lessons 검토

### 4. 완료 전 검증

- 작동 증명 없이 작업 완료 처리 금지
- 관련 있을 때 main 브랜치와 변경사항 diff 비교
- "시니어 엔지니어가 이걸 승인할까?" 자문
- 테스트 실행, 로그 확인, 정확성 검증

### 5. 우아함 추구 (균형 잡힌)

- 비자명한 변경: "더 우아한 방법이 있는가?" 한 번 멈추고 생각
- 해키하게 느껴지면: 알고 있는 모든 것을 동원해 우아한 해결책 구현
- 단순하고 명백한 수정에는 이 단계 생략 — 오버엔지니어링 금지
- 제시하기 전에 자신의 작업을 먼저 검증

### 6. 자율적 버그 수정

- 버그 리포트를 받으면: 질문 없이 바로 수정
- 로그, 에러, 실패 테스트를 직접 찾아서 해결
- 유저의 context switching 최소화
- CI 실패도 지시 없이 스스로 수정

## 작업 관리

1. **계획 수립**: `tasks/todo.md`에 체크 가능한 항목으로 계획 작성
2. **계획 확인**: 구현 시작 전 유저와 체크인
3. **진행 추적**: 완료된 항목은 즉시 체크
4. **변경 설명**: 각 단계마다 하이레벨 요약 제공
5. **결과 기록**: `tasks/todo.md`에 리뷰 섹션 추가
6. **교훈 기록**: 수정 지시 후 `tasks/lessons.md` 업데이트
