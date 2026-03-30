# Landing Page TODO

> 계획 상세: `docs/landing-page-plan.md`

## Phase 1: Foundation

- [x] GSAP 설치 (`bun add gsap`)
- [x] `three/core/landing-scene.ts` — `createLandingScene(canvas)` 팩토리 함수
  - [x] WebGPURenderer + Scene + PerspectiveCamera 초기화
  - [x] `renderer.setAnimationLoop()` 설정
  - [x] resize 핸들러 (rAF 디바운스)
  - [x] `{ init, dispose, scene, camera, renderer }` 반환
- [x] `three/core/landing-scene-state.ts` — landingSceneState plain object + 타입 정의
- [x] `three/objects/sphere.ts` — 파티클 구체
  - [x] fibonacci 구면 분포 좌표 계산 (~2000개)
  - [x] TSL PointsNodeMaterial 셰이더 구성
  - [x] morphProgress uniform (구체 ↔ 클러스터 보간)
  - [x] 자동 회전 + wave 모션
  - [x] 마우스 포인터 기반 X/Y축 회전 (느린 자동 회전 병행)
- [x] `three/objects/particles.ts` — Ambient 배경 파티클 (~200개)
  - [x] TSL로 크기/투명도 애니메이션

**→ Phase 1 완료 후 유저 확인**

## Phase 2: GSAP 통합

- [x] `hooks/use-landing-scene.ts` — React hook
  - [x] canvas ref → init() 호출
  - [x] unmount 시 dispose()
- [x] `animations/scroll-timeline.ts` — GSAP ScrollTrigger 설정
  - [x] ScrollTrigger plugin 등록
  - [x] 섹션별 ScrollTrigger 인스턴스 (pin + scrub)
  - [x] sceneState 값 tween 연동

**→ Phase 2 완료 후 유저 확인**

## Phase 3: 페이지 조립

- [x] `src/pages/landing/` 디렉토리 구조 생성
- [x] `HomePage.tsx` — 메인 페이지 컴포넌트
  - [x] fixed canvas 요소
  - [x] 7개 섹션 div (각 h-screen)
  - [x] 기존 `src/pages/HomePage.tsx`에서 직접 import
- [x] `components/shared/SectionText.tsx` — 재사용 텍스트 블록
- [x] `components/hero/HeroSection.tsx` — 타이틀 + 태그라인 + CTA
- [x] `components/features/FeatureExplorer.tsx` — 3D 파일 탐색기 텍스트
- [x] `components/features/FeatureDragDrop.tsx` — 드래그 앤 드롭 텍스트
- [x] `components/features/FeatureContextMenu.tsx` — 컨텍스트 메뉴 텍스트
- [x] `components/features/FeaturePreview.tsx` — 파일 미리보기 텍스트
- [x] `components/features/FeatureCamera.tsx` — 카메라 컨트롤 텍스트
- [x] `components/footer/FooterCTA.tsx` — 최종 CTA
- [x] `animations/text-animations.ts` — 텍스트 reveal 애니메이션

**→ Phase 3 완료 후 유저 확인**

## Phase 4: 섹션별 3D 효과

> 상세 계획: `docs/plans/phase4-3d-effects-plan.md`

- [x] `three/objects/tree-layout.ts` — 방사형 트리 좌표 계산
  - [x] 루트(~200) + 폴더(~150×5) + 파일(~50×15) 배치
  - [x] `createTreeLayout(count)` → Float32Array + nodes
- [x] `three/objects/sphere.ts` 수정 — 3단계 morph 셰이더
  - [x] treePosAttr 추가 (기존 clusterPosAttr 교체)
  - [x] 구체→점 수렴→트리 폭발 (collapseT + expandT)
- [x] `scroll-timeline.ts` 업데이트 — 카메라 애니메이션
  - [x] Sec 3→4: 줌인 (z:5→3)
  - [x] Sec 5→6: 줌아웃 + 공전 (orbitTheta 0→2π)
  - [x] Sec 6→7: 원점 복귀
- [x] `three/objects/tree-lines.ts` — 노드 간 연결선
  - [x] LineSegments + LineBasicMaterial
  - [x] expandT에 연동하여 fade in
- [x] `three/effects/drag-trail.ts` — 드래그 애니메이션 (Section 3)
  - [x] dragGroupAttr (이동 대상 파티클 마킹)
  - [x] 포물선 아크 이동 + 글로우 트레일
- [x] `overlay/ContextMenuOverlay.tsx` — HTML 오버레이 (Section 4)
  - [x] glassmorphism + scroll-synced opacity
- [x] `overlay/PreviewOverlay.tsx` — HTML 오버레이 (Section 5)
  - [x] 프리뷰 카드 glassmorphism + scroll-synced opacity

**→ Phase 4 완료 후 유저 확인**

## Phase 4.5: 섹션별 3D 효과 보완

> 상세 계획: `docs/plans/phase4.5-effects-polish-plan.md`

- [x] Step 1: 스크롤 스냅
  - [x] ScrollTrigger `snap: 1/6` 옵션 추가 (섹션 단위 스냅)
- [x] Step 2: 드래그 애니메이션 재구현
  - [x] `drag-trail.ts` — 폴더 전체(300개 파티클) 드래그 대상으로 변경
  - [x] `drag-trail.ts` — 도착 좌표를 상수로 설정 (constants.ts LANDING.drag)
  - [x] `sphere.ts` — 단방향 드래그 (0→1) + sin 커브 글로우 (도착 시 해제)
  - [x] `tree-lines.ts` — 연결선 3그룹 분리 (static/drag/new), 드래그 시 fade out → 도착 시 새 연결선 fade in
  - [x] `scroll-timeline.ts` — 드래그 리셋 제거, 섹션 전체 사용
- [ ] Step 3: 오버레이 위치 & 등장 개선
  - [ ] ContextMenuOverlay, PreviewOverlay 위치 미세 조정
  - [ ] 등장 시 translateY 슬라이드업 애니메이션 추가

**→ Phase 4.5 완료 후 유저 확인**

## Phase 5: 폴리시

- [ ] 모바일 반응형
  - [ ] 파티클 수 조절 (~800 on mobile)
  - [ ] 카메라 거리 조정
  - [ ] 텍스트 레이아웃 조정
  - [ ] matchMedia 기반 ScrollTrigger 분기
- [ ] 퍼포먼스 최적화
  - [ ] `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
  - [ ] 디바이스 성능 기반 파티클 수 조절
  - [ ] `will-change: transform` 텍스트 요소
- [ ] `bun run build` 빌드 성공 확인
- [ ] Lighthouse 퍼포먼스 점수 확인
