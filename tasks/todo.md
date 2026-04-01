# 3Drive 마이그레이션 TODO

> 원본: [docs/migration-todo.md](../docs/migration-todo.md)

## Phase 1: 프로젝트 세팅

- [x] 새 디렉토리에 Vite + React + TypeScript 프로젝트 생성
- [x] Tailwind CSS 4 설치 및 설정
- [x] React Router 설치 및 설정
- [x] Zustand 설치
- [x] `@/*` path alias 설정 (vite.config.ts, tsconfig.json)
- [x] `public/` 정적 파일 복사 (models, icon-tex, videos, 배경)
- [x] `lib/` 유틸리티 파일 복사 (sample-tree, tree-utils, positioning, extension, angles, guides)
- [x] GitHub Actions CI 워크플로우 생성 (`.github/workflows/ci.yml` — lint, type-check, build)
- [x] Node.js 24 런타임 강제 설정 (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`)
- [x] Branch protection ruleset 적용 (main 직접 push 차단, PR 필수, CI 통과 필수)

## Phase 1.5: 테스트 인프라 및 비즈니스 로직 검증

- [x] Vitest 설정 (`vitest.config.ts`, path alias 연동)
- [x] 비즈니스 로직 유닛 테스트 작성
  - [x] `tree-utils.ts` — 트리 탐색, 노드 검색, 경로 계산
  - [x] `positioning.ts` — 3D 좌표 배치 로직
  - [x] `extension.ts` — 파일 확장자 → 타입 매핑
  - [x] `angles.ts` — 앵글 프리셋 계산
- [x] MSW 설정 (`src/mocks/`)
  - [x] `handlers.ts` — API 핸들러 정의
  - [x] `browser.ts` — 브라우저 환경 워커 설정
  - [x] `server.ts` — 테스트 환경 서버 설정
- [x] 목 데이터 설정
  - [x] `src/mocks/data/` — 파일 트리, 유저 등 목 데이터 정의
  - [x] `sample-tree.ts` 기반 테스트용 fixture 작성

## Phase 2: 기본 구조 구축

- [x] React Router 라우트 설정 (`/`, `/drive`)
- [x] Toaster 설정 (shadcn + sonner)
- [x] Zustand 스토어: `modal-store.ts` (열기/닫기, 타입, props)
- [x] 모달 시스템 구축 (ModalRenderer + 개별 모달 컴포넌트, shadcn Dialog)
  - [x] FileModal (스텁)
  - [x] UploadModal (스텁)
  - [x] CreateFolderModal (스텁)
  - [x] GuideModal (스텁)
  - [x] SettingModal (스텁)

## Phase 2.5: 랜딩페이지 구현(Main Page)

- [x] landing page todo 참고 (`tasks/landing-todo.md`)
  - Phase 5(모바일/퍼포먼스 폴리시)는 Drive 완성 후 진행 예정

---

## Phase 3: 3D 엔진 & 빈 씬 렌더링

> 목표: DrivePage에 Three.js 캔버스가 떠서 빈 씬이 렌더링되는 상태
> 컨벤션: `three/core/landing-scene.ts` 팩토리 패턴 따름

- [x] `three/core/drive-scene.ts` — `createDriveScene(canvas)` 팩토리 함수
  - [x] Scene + PerspectiveCamera + WebGPURenderer 초기화 (`DRIVEPAGE_CAMERA` 사용)
  - [x] `renderer.init()` await + `setAnimationLoop` 등록
  - [x] resize 핸들러 (rAF 디바운스)
  - [x] OrbitControls 설정 (damping, 줌 제한 등)
  - [x] `dispose()` 정리 함수
  - [x] `{ init, dispose, scene, camera, renderer, controls }` 반환
- [x] `three/core/drive-scene-state.ts` — driveSceneState plain object + 타입
- [x] Lights 설정 (AmbientLight + DirectionalLight, drive-scene.ts 내부)
- [x] `src/hooks/use-drive-scene.ts` — React hook (`useLandingScene` 패턴)
  - [x] canvas ref → `createDriveScene(canvas)` 호출
  - [x] unmount 시 dispose()
- [x] `DrivePage.tsx` — fixed canvas + hook 연결, 빈 씬 렌더링 확인

**→ Phase 3 완료 후 유저 확인**

## Phase 4: 3D 파일 노드 & 트리 시각화

> 목표: mock 데이터로 파일/폴더 구체가 3D 공간에 배치되는 상태

- [ ] `src/three/loaders.ts` — GLTFLoader + 모델 캐싱 (파일/폴더 모델)
- [ ] `src/three/objects/file-node.ts` — 파일/폴더 3D 오브젝트 생성
  - [ ] 타입별 모델 로드 (폴더, 이미지, 문서, 비디오 등)
  - [ ] 호버/선택 상태 시각 피드백
- [ ] `src/three/scene-manager.ts` — 트리 데이터 → 3D 씬 동기화
  - [ ] `positioning.ts` 연동하여 Node[] → 3D 배치
  - [ ] 현재 폴더 기준 자식 노드만 렌더링
  - [ ] 노드 추가/제거 시 씬 업데이트
- [ ] 파일 라벨 표시 (CSS2DRenderer 오버레이)
- [ ] mock 데이터 → 3D 트리 렌더링 확인

**→ Phase 4 완료 후 유저 확인**

## Phase 5: 인터랙션 & 카메라

> 목표: 클릭/드래그/우클릭이 동작하고 카메라 전환이 되는 상태

- [ ] `src/three/raycaster.ts` — Raycaster 이벤트 시스템
  - [ ] 클릭 (파일 선택)
  - [ ] 더블클릭 (폴더 진입)
  - [ ] 우클릭 (컨텍스트 메뉴 트리거)
  - [ ] 호버 (커서 변경 + 하이라이트)
- [ ] `src/three/camera-animator.ts` — GSAP 기반 카메라 애니메이션
  - [ ] 폴더 진입/이탈 시 카메라 이동
  - [ ] 앵글 프리셋 전환 (`constants/camera-angles.ts` 연동)
- [ ] 드래그앤드롭 (파일 → 폴더 이동)
  - [ ] 드래그 시작/이동/종료 처리
  - [ ] 드롭 대상 폴더 하이라이트

**→ Phase 5 완료 후 유저 확인**

## Phase 6: UI 레이아웃 & 페이지 조립

> 목표: DrivePage에 모든 UI 요소가 통합된 상태

- [ ] `src/stores/ui-store.ts` — Zustand (사이드바, 검색, 컨텍스트 메뉴, 로딩)
- [ ] `src/components/layout/SideNav.tsx` — 사이드 네비게이션
- [ ] `src/components/layout/GlobalNav.tsx` — 상단 네비게이션
- [ ] `src/components/search/SearchBar.tsx` — 검색 바
  - [ ] 트리 필터 → 3D 씬 업데이트
- [ ] `src/components/context-menu/ContextMenu.tsx` — 우클릭 메뉴
  - [ ] 3D 우클릭 → Zustand → React UI 연동
- [ ] DrivePage 최종 조립 (ThreeCanvas + SideNav + SearchBar + 모달)

**→ Phase 6 완료 후 유저 확인**

## Phase 7: 마무리 & 폴리시

- [ ] 휴지통 (trash-zone 오브젝트 + 삭제/복원)
- [ ] 키보드 단축키 (Cmd/Ctrl+F 검색 등)
- [ ] 온보딩/가이드 모달
- [ ] 반응형 처리 (resize, 모바일 대응)
- [ ] 퍼포먼스 최적화 (pixelRatio 제한, 디바이스 기반 조절)
- [ ] Three.js 메모리 관리 점검 (dispose 누락 확인)
- [ ] 페이지 이동 시 씬 cleanup 확인
- [ ] `bun run build` 빌드 성공 확인
