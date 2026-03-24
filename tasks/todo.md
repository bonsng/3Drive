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
- [ ] App.tsx 레이아웃 (GlobalNav)
- [x] Toaster 설정 (shadcn + sonner)
- [x] Zustand 스토어: `modal-store.ts` (열기/닫기, 타입, props)
- [ ] Zustand 스토어: `ui-store.ts` (사이드바, 검색, 컨텍스트 메뉴, 로딩, 배경)
- [x] 모달 시스템 구축 (ModalRenderer + 개별 모달 컴포넌트, shadcn Dialog)
  - [x] FileModal (스텁)
  - [x] UploadModal (스텁)
  - [x] CreateFolderModal (스텁)
  - [x] GuideModal (스텁)
  - [x] SettingModal (스텁)

## Phase 3: Three.js 씬 기본 구축 (WebGPURenderer)

- [ ] `engine.ts` — Scene, Camera, WebGPURenderer 초기화 (async init) + setAnimationLoop
- [ ] `lights.ts` — AmbientLight, DirectionalLight
- [ ] `controls.ts` — OrbitControls (`three/addons`)
- [ ] `ThreeCanvas.tsx` — React ↔ Three.js 브릿지 컴포넌트 (비동기 엔진 초기화)
- [ ] WebGPU 미지원 브라우저 fallback 처리 (WebGLRenderer)
- [ ] 빈 씬이 렌더링되는 것 확인

## Phase 4: 3D 오브젝트 구현

- [ ] `loaders.ts` — GLTFLoader 유틸리티 + 모델 캐싱
- [ ] `file-node.ts` — 파일/폴더 구체 오브젝트 생성
- [ ] 파일 라벨 표시 (CSS 오버레이 or Canvas 텍스트)
- [ ] 트리 데이터 → 3D 오브젝트 배치 (positioning.ts 연동)
- [ ] 기본 파일 탐색기 화면 완성 (mock 데이터 로드 → 구체 배치)

## Phase 5: 인터랙션 구현

- [ ] `raycaster.ts` — 클릭, 우클릭, 호버 이벤트
- [ ] 더블클릭 → 폴더 진입 (카메라 이동)
- [ ] 드래그앤드롭 (파일 → 폴더 이동)
- [ ] `camera-animator.ts` — GSAP 기반 카메라 전환 (앵글 프리셋)
- [ ] 컨텍스트 메뉴 연동 (3D 우클릭 → Zustand → React UI)
- [ ] 검색 기능 (SearchBar → 트리 필터 → 3D 씬 업데이트)

## Phase 6: 페이지 완성

- [ ] DrivePage — ThreeCanvas + SideNav + SearchBar + 모달 + 가이드 모달 통합
- [ ] HomePage — 랜딩 페이지 (DrivePage로 진입하는 CTA)

## Phase 7: 마무리

- [ ] 백엔드 API 응답에서 trash를 별도 필드로 분리 (`{ root: BackendNode, trash: BackendNode[] }`)
  - 프론트에서 `'휴지통'` 매직 스트링 검색 제거, `processBackendTree` 단순화
- [ ] 휴지통 3D 씬 (trash-zone 오브젝트 + 삭제/복원)
- [ ] 포스트프로세싱 (TSL 노드 기반, 필요한 경우만)
- [ ] 반응형 처리 (resize → camera.aspect + renderer.setSize)
- [ ] 키보드 단축키 (Cmd/Ctrl+F 검색 등)
- [ ] 온보딩/가이드 모달
- [ ] Three.js 메모리 관리 점검 (dispose 누락 확인)
- [ ] 페이지 이동 시 씬 cleanup 확인
