# 3Drive 마이그레이션 계획서

> Next.js + R3F + React Context → React + Vite + Three.js + Zustand

## 1. 목표

- Next.js 제거, Vite 기반 SPA로 전환
- React Three Fiber 제거, 순수 Three.js로 3D 렌더링
- React Context 제거, Zustand로 상태 관리 일원화 (UI 상태 전용)
- Three.js 씬 내부 상태는 Three.js 자체 관리
- 인증/백엔드 연동 없이 mock 데이터로 동작
- 기존 핵심 로직(트리 처리, 3D 좌표 계산, 파일 타입 매핑) 재활용

---

## 2. 기술 스택 변경

| 현재 | 변경 후 | 비고 |
|------|---------|------|
| Next.js 15 (App Router) | Vite + React 19 | SPA, 파일 기반 라우팅 제거 |
| React Three Fiber | Three.js (직접 사용) | WebGPURenderer, Scene, Camera 직접 관리 |
| @react-three/drei | three-stdlib / 직접 구현 | OrbitControls, GLTFLoader 등 |
| @react-three/postprocessing | Three.js TSL 포스트프로세싱 | WebGPU 네이티브 노드 기반 |
| React Context (6개 Provider) | Zustand | UI 상태 전용 |
| next/navigation | React Router v7 | useNavigate, useParams |
| Framer Motion | 유지 | UI 애니메이션 |
| GSAP | 유지 | 카메라 애니메이션 |
| Tailwind CSS 4 | 유지 | 스타일링 |

---

## 3. 새 디렉토리 구조

```
3drive/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
├── public/
│   ├── models/          # GLB 3D 모델 (기존 그대로)
│   ├── icon-tex/        # 아이콘 텍스처 (기존 그대로)
│   ├── videos/          # 가이드 영상 (기존 그대로)
│   └── grid-bg*.png     # 배경 이미지
└── src/
    ├── main.tsx                # React 진입점
    ├── App.tsx                 # 라우터 + 레이아웃
    ├── globals.css
    │
    ├── pages/                  # 라우트 단위 페이지
    │   ├── HomePage.tsx        # 랜딩/메인
    │   └── DrivePage.tsx       # 3D 파일 탐색기 (mock 데이터, 가이드 모달 포함)
    │
    ├── three/                  # Three.js 핵심 (React 무관)
    │   ├── engine.ts           # Scene, Camera, Renderer 초기화 + 애니메이션 루프
    │   ├── controls.ts         # OrbitControls 래퍼
    │   ├── raycaster.ts        # 클릭/호버/드래그 이벤트
    │   ├── camera-animator.ts  # GSAP 기반 카메라 전환
    │   ├── lights.ts           # 조명 설정
    │   ├── effects.ts          # 포스트프로세싱 (TSL 노드 기반)
    │   └── objects/
    │       ├── file-node.ts    # 파일 구체 오브젝트 생성/관리
    │       ├── folder-node.ts  # 폴더 오브젝트
    │       ├── trash-zone.ts   # 휴지통 3D 오브젝트
    │       ├── search-node.ts  # 검색 결과 노드
    │       ├── logo.ts         # 로고 3D 모델 + 회전 애니메이션
    │       └── loaders.ts      # GLTFLoader 유틸리티
    │
    ├── stores/                 # Zustand (UI 상태 전용)
    │   ├── modal-store.ts      # 모달 열기/닫기, 타입, props
    │   └── ui-store.ts         # 사이드바, 검색바, 컨텍스트 메뉴, 로딩, 배경
    │
    ├── components/             # React UI 컴포넌트
    │   ├── layout/
    │   │   ├── GlobalNav.tsx
    │   │   ├── SideNav.tsx
    │   │   └── SettingHelpNav.tsx
    │   ├── modal/
    │   │   ├── ModalRenderer.tsx
    │   │   ├── FileModal.tsx
    │   │   ├── UploadModal.tsx
    │   │   ├── CreateFolderModal.tsx
    │   │   ├── GuideModal.tsx
    │   │   └── SettingModal.tsx
    │   ├── search/
    │   │   └── SearchBar.tsx    # Framer Motion 유지
    │   ├── context-menu/
    │   │   └── ContextMenu.tsx
    │   └── ThreeCanvas.tsx      # Three.js ↔ React 연결 컴포넌트
    │
    ├── lib/                    # 순수 유틸리티 (기존 재활용)
    │   ├── sample-tree.ts      # mock 데이터 (그대로)
    │   ├── tree-utils.ts       # 트리 순회 (그대로)
    │   ├── positioning.ts      # 3D 좌표 계산 (그대로)
    │   ├── extension.ts        # 파일 타입 매핑 (그대로)
    │   ├── angles.ts           # 카메라 프리셋 (그대로)
    │   └── guides.ts           # 튜토리얼 데이터 (그대로)
    │
    ├── hooks/                  # React 커스텀 훅
    │   ├── useDebounce.ts
    │   └── useKeyboardShortcuts.ts
    │
    └── types/
        ├── tree.ts             # Node, PositionedNode
        └── modal.ts            # ModalTypes, ModalPropsMap
```

---

## 4. 핵심 아키텍처 설계

### 4.1 Three.js ↔ React 연결 패턴

```
┌─────────────────────────────────────────────────┐
│  React (UI 레이어)                               │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Zustand   │  │ 모달     │  │ 검색바/메뉴   │  │
│  │ Stores    │  │ 컴포넌트 │  │ 컴포넌트      │  │
│  └─────┬────┘  └──────────┘  └───────────────┘  │
│        │                                         │
│  ┌─────▼──────────────────────────────────────┐  │
│  │ ThreeCanvas.tsx                             │  │
│  │ - useEffect로 engine 초기화                 │  │
│  │ - useEffect로 cleanup                       │  │
│  │ - div ref를 renderer.domElement에 연결      │  │
│  └─────┬──────────────────────────────────────┘  │
└────────┼─────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────┐
│  Three.js (3D 레이어, React 의존성 없음)          │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ engine   │  │ raycaster│  │ objects/       │  │
│  │ (씬관리) │  │ (이벤트) │  │ (3D 오브젝트) │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────────────────────────────────────────────────┘
```

### 4.2 ThreeCanvas 컴포넌트 (브릿지 역할)

```tsx
// src/components/ThreeCanvas.tsx
import { useEffect, useRef } from 'react'
import { createEngine } from '../three/engine'

export function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let engine: Awaited<ReturnType<typeof createEngine>>

    createEngine(containerRef.current).then((e) => {
      engine = e
    })

    return () => engine?.dispose()
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
```

### 4.3 Three.js 엔진 구조

```ts
// src/three/engine.ts
import WebGPURenderer from 'three/webgpu'

export async function createEngine(container: HTMLElement) {
  const renderer = new WebGPURenderer({ antialias: true })
  await renderer.init() // WebGPU는 비동기 초기화 필요
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, ...)

  container.appendChild(renderer.domElement)
  setupLights(scene)
  const controls = setupControls(camera, renderer)
  const raycaster = setupRaycaster(camera, renderer, scene)

  renderer.setAnimationLoop(() => {
    controls.update()
    renderer.render(scene, camera)
  })

  return {
    scene,
    camera,
    renderer,
    dispose: () => { renderer.setAnimationLoop(null); ... },
    loadTree: (data) => { ... },
    focusNode: (nodeId) => { ... },
  }
}
```

### 4.4 3D 이벤트 → Zustand 연결

```ts
// src/three/raycaster.ts
import { useModalStore } from '../stores/modal-store'
import { useUiStore } from '../stores/ui-store'

export function setupRaycaster(camera, renderer, scene) {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  renderer.domElement.addEventListener('click', (e) => {
    // ... raycasting 로직
    const intersected = raycaster.intersectObjects(scene.children, true)
    if (intersected.length > 0) {
      const node = intersected[0].object.userData
      useModalStore.getState().open('FileModal', { node })
    }
  })

  renderer.domElement.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    // ... raycasting
    useUiStore.getState().openContextMenu(node, { x: e.clientX, y: e.clientY })
  })
}
```

### 4.5 Zustand 스토어 설계

```ts
// src/stores/modal-store.ts
interface ModalState {
  isOpen: boolean
  modalType: ModalTypes | null
  props: Record<string, unknown>
  open: (type: ModalTypes, props?: Record<string, unknown>) => void
  close: () => void
}

// src/stores/ui-store.ts
interface UiState {
  showNav: boolean
  showSearch: boolean
  showPreSearch: boolean
  isLoading: boolean
  contextMenu: { nodeId: number; x: number; y: number } | null
  bgIndex: number
  // actions
  toggleNav: () => void
  openContextMenu: (nodeId: number, pos: { x: number; y: number }) => void
  closeContextMenu: () => void
  setLoading: (v: boolean) => void
}
```

---

## 5. 파일별 마이그레이션 매핑

### 5.1 그대로 재활용 (변경 없음)

| 현재 파일 | 새 위치 |
|-----------|---------|
| `lib/sample-tree.ts` | `src/lib/sample-tree.ts` |
| `lib/tree-utils.ts` | `src/lib/tree-utils.ts` |
| `lib/positioning.ts` | `src/lib/positioning.ts` |
| `lib/extension.ts` | `src/lib/extension.ts` |
| `lib/angles.ts` | `src/lib/angles.ts` |
| `lib/guides.ts` | `src/lib/guides.ts` |
| `public/models/*` | `public/models/*` |
| `public/icon-tex/*` | `public/icon-tex/*` |
| `public/videos/*` | `public/videos/*` |

### 5.2 전면 재작성 (Three.js 전환)

| 현재 (R3F) | 새 파일 (Three.js) | 주요 변경 |
|------------|-------------------|----------|
| `3d-components/file/file-sphere.tsx` | `three/objects/file-node.ts` | useFrame → animate loop, R3F 이벤트 → Raycaster |
| `3d-components/file/floating-file.tsx` | `three/objects/file-node.ts` (통합) | 드래그 시 오브젝트 위치 업데이트 |
| `3d-components/camera/camera-controls.tsx` | `three/controls.ts` + `three/camera-animator.ts` | OrbitControls 직접 import, GSAP 유지 |
| `3d-components/camera/camera-zoom-control.tsx` | `three/controls.ts` (통합) | wheel 이벤트 직접 바인딩 |
| `3d-components/camera/Lights.tsx` | `three/lights.ts` | JSX → `new THREE.DirectionalLight()` |
| `3d-components/trash/trash-can.tsx` | `three/objects/trash-zone.ts` | useGLTF → GLTFLoader, useFrame → animate |
| `3d-components/trash/trash-file-sphere.tsx` | `three/objects/trash-zone.ts` (통합) | 동일 |
| `3d-components/search/search-group.tsx` | `three/objects/search-node.ts` | 동일 |
| `3d-components/search/search-file-sphere.tsx` | `three/objects/search-node.ts` (통합) | 동일 |
| `lib/file-model.tsx` | `three/objects/loaders.ts` | useGLTF → GLTFLoader.load() |
| `lib/folder-model.tsx` | `three/objects/loaders.ts` (통합) | 동일 |
| `lib/logo-model.tsx` | `three/objects/logo.ts` | useFrame → animate, 직접 회전 |
| `lib/root-model.tsx` | `three/objects/loaders.ts` (통합) | 동일 |
| `MainPage/main-page-3d.tsx` | `three/engine.ts` + `components/ThreeCanvas.tsx` | Canvas → WebGPURenderer |

### 5.3 React 컴포넌트 리팩토링

| 현재 | 새 파일 | 주요 변경 |
|------|---------|----------|
| `providers.tsx` (6중 Context) | 삭제 | Zustand로 대체, Provider 불필요 |
| `context/file-tree-context.tsx` | Three.js 내부 관리 + `ui-store.ts` | 트리 데이터는 engine이 관리, UI 상태만 Zustand |
| `context/loading-context.tsx` | `stores/ui-store.ts` | isLoading 필드 |
| `context/nav-context.tsx` | `stores/ui-store.ts` | showNav, viewState 등 |
| `context/short-cut-context.tsx` | `hooks/useKeyboardShortcuts.ts` + `stores/ui-store.ts` | 키보드 이벤트 훅 분리 |
| `context/folder-ref-context.tsx` | 삭제 | Three.js scene graph가 대체 |
| `context/bg-context.tsx` | `stores/ui-store.ts` | bgIndex 필드 |
| `Modal/modal-context.provider.tsx` | `stores/modal-store.ts` | useReducer → Zustand |
| `Modal/*.tsx` (개별 모달) | `components/modal/*.tsx` | Context → Zustand hook |
| `Components/side-nav.tsx` | `components/layout/SideNav.tsx` | Context → Zustand |
| `Components/global-nav.tsx` | `components/layout/GlobalNav.tsx` | next/link → React Router |
| `Components/finder.tsx` | `three/objects/` (3D) + 삭제 (UI) | R3F 컴포넌트 → Three.js 오브젝트 |
| `Components/onboarding.tsx` | `components/Onboarding.tsx` | 최소 변경 |

### 5.4 Next.js → React Router 전환

| 현재 (App Router) | 새 라우트 | 페이지 컴포넌트 |
|-------------------|----------|----------------|
| `app/page.tsx` | `/` | `pages/HomePage.tsx` |
| `app/example/page.tsx` | `/drive` | `pages/DrivePage.tsx` |
| `app/layout.tsx` | - | `App.tsx` (레이아웃 통합) |
| `app/login/page.tsx` | 삭제 | - |
| `app/signup/page.tsx` | 삭제 | - |
| `app/api/auth/[...nextauth]/route.ts` | 삭제 | - |
| `app/api/signup/route.ts` | 삭제 | - |

---

## 6. R3F → Three.js 주요 변환 패턴

### 6.1 useFrame → requestAnimationFrame

```tsx
// Before (R3F)
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.5
})

// After (Three.js + WebGPURenderer)
// setAnimationLoop 사용 (requestAnimationFrame 대신)
renderer.setAnimationLoop(() => {
  mesh.rotation.y += clock.getDelta() * 0.5
  renderer.render(scene, camera)
})
```

### 6.2 useGLTF → GLTFLoader

```tsx
// Before (R3F)
const { scene } = useGLTF('/models/file.glb')
return <primitive object={scene} />

// After (Three.js)
const loader = new GLTFLoader()
loader.load('/models/file.glb', (gltf) => {
  scene.add(gltf.scene)
})
```

### 6.3 R3F 이벤트 → Raycaster

```tsx
// Before (R3F)
<mesh onClick={(e) => handleClick(e)} onPointerOver={(e) => handleHover(e)}>

// After (Three.js)
const raycaster = new THREE.Raycaster()
canvas.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(scene.children, true)
  if (hits.length > 0) handleClick(hits[0])
})
```

### 6.4 Html (drei) → CSS 오버레이

```tsx
// Before (R3F)
<Html position={[0, 1, 0]}><div className="label">파일명</div></Html>

// After (Three.js)
// 3D 좌표 → 2D 스크린 좌표 변환
const screenPos = worldToScreen(object.position, camera)
// React에서 absolute 위치로 렌더링
<div style={{ position: 'absolute', left: screenPos.x, top: screenPos.y }}>파일명</div>
```

---

## 7. 삭제 대상 의존성

```
@react-three/fiber
@react-three/drei
@react-three/postprocessing
next
next-auth
eslint-config-next
maath
bcryptjs
jsonwebtoken
postprocessing
```

## 8. 추가 의존성

```
vite
react-router
zustand
@vitejs/plugin-react
```

> **참고**: Three.js r174+ 기준 WebGPURenderer, OrbitControls, GLTFLoader 등은 모두 `three/webgpu`, `three/addons` 에서 import 가능. three-stdlib, postprocessing 별도 설치 불필요.

---

## 9. 마이그레이션 단계별 진행 순서

### Phase 1: 프로젝트 세팅
1. 새 디렉토리에 Vite + React + TypeScript 프로젝트 생성
2. Tailwind CSS 4, React Router, Zustand 설치 및 설정
3. `@/*` path alias 설정 (vite.config.ts)
4. `public/` 정적 파일 복사 (models, icon-tex, videos, 배경)
5. `lib/` 유틸리티 파일 복사 (변경 없이 그대로)

### Phase 2: 기본 구조 구축
6. React Router 라우트 설정 (/, /drive)
7. Zustand 스토어 2개 생성 (modal-store, ui-store)
8. App.tsx 레이아웃 (GlobalNav, Toaster)
9. 모달 시스템 구축 (Zustand 기반 ModalRenderer)

### Phase 3: Three.js 씬 기본 구축
10. engine.ts — Scene, Camera, Renderer, animate loop
11. lights.ts — 조명 설정
12. controls.ts — OrbitControls
13. ThreeCanvas.tsx — React ↔ Three.js 브릿지
14. 빈 씬이 렌더링되는 것 확인

### Phase 4: 3D 오브젝트 구현
15. loaders.ts — GLTFLoader 유틸리티 (모델 캐싱 포함)
16. file-node.ts — 파일/폴더 구체 생성, 라벨 표시
17. 트리 데이터 → 3D 오브젝트 배치 (positioning.ts 연동)
18. 기본 파일 탐색기 화면 완성

### Phase 5: 인터랙션 구현
19. raycaster.ts — 클릭, 우클릭, 호버 이벤트
20. 드래그앤드롭 (파일 이동)
21. camera-animator.ts — GSAP 카메라 전환
22. 컨텍스트 메뉴 연동 (3D 클릭 → Zustand → React UI)
23. 검색 기능 (검색바 → 트리 필터 → 3D 씬 업데이트)

### Phase 6: 페이지 완성
24. DrivePage — 3D 탐색기 + UI 통합 + 가이드 모달
25. HomePage — 랜딩 페이지

### Phase 7: 마무리
26. 휴지통 3D 씬
27. 포스트프로세싱 (필요한 경우만)
28. 반응형 처리 (resize 이벤트)
29. 키보드 단축키 (Cmd+F 검색 등)
30. 온보딩/가이드 모달

---

## 10. 주의사항

- **WebGPU 비동기 초기화**: `renderer.init()`이 Promise를 반환하므로 async/await 처리 필요. WebGPU 미지원 브라우저 대비 WebGL fallback 고려
- **WebGPU import 경로**: `three/webgpu`에서 WebGPURenderer, `three/addons`에서 OrbitControls, GLTFLoader 등 import
- **setAnimationLoop**: WebGPURenderer는 `requestAnimationFrame` 대신 `renderer.setAnimationLoop()` 사용
- **Three.js 메모리 관리**: dispose()를 빠짐없이 호출해야 메모리 누수 방지
  - geometry.dispose(), material.dispose(), texture.dispose()
  - 페이지 이동 시 전체 씬 cleanup
- **모델 캐싱**: GLTFLoader로 같은 모델 반복 로드하지 않도록 캐시 구현
- **resize 핸들링**: window resize 시 camera.aspect, renderer.setSize 업데이트
- **CSS 오버레이 동기화**: 3D 라벨을 CSS로 표시할 경우 매 프레임 좌표 변환 필요
- **트리 데이터 관리 위치**: 트리 데이터(CRUD)는 Three.js engine 내부에서 관리하되, 트리 변경 시 Zustand를 통해 UI에 알림
- **페이지 구성**: HomePage(랜딩)와 DrivePage(3D 탐색기) 2개만 존재, 인증 페이지 없음
