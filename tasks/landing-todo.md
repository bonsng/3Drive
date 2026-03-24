# Landing Page TODO

> 계획 상세: `docs/landing-page-plan.md`

## Phase 1: Foundation

- [x] GSAP 설치 (`bun add gsap`)
- [ ] `src/pages/landing/` 디렉토리 구조 생성
- [ ] `three/core/landing-scene.ts` — WebGPURenderer + Scene + Camera 초기화
  - [ ] async `renderer.init()` 처리
  - [ ] `renderer.setAnimationLoop()` 설정
  - [ ] resize 핸들러
  - [ ] `init(canvas)` / `dispose()` export
- [ ] `three/core/scene-state.ts` — sceneState plain object + 타입 정의
- [ ] `three/objects/sphere.ts` — 파티클 구체
  - [ ] fibonacci 구면 분포 좌표 계산 (~2000개)
  - [ ] TSL PointsNodeMaterial 셰이더 구성
  - [ ] morphProgress uniform (구체 ↔ 클러스터 보간)
  - [ ] 자동 회전 + wave 모션
- [ ] `three/objects/particles.ts` — Ambient 배경 파티클 (~200개)
  - [ ] TSL로 크기/투명도 애니메이션

**→ Phase 1 완료 후 유저 확인**

## Phase 2: GSAP 통합

- [ ] `hooks/use-landing-scene.ts` — React hook
  - [ ] canvas ref → init() 호출
  - [ ] unmount 시 dispose()
- [ ] `animations/scroll-timeline.ts` — GSAP ScrollTrigger 설정
  - [ ] ScrollTrigger plugin 등록
  - [ ] 섹션별 ScrollTrigger 인스턴스 (pin + scrub)
  - [ ] sceneState 값 tween 연동

**→ Phase 2 완료 후 유저 확인**

## Phase 3: 페이지 조립

- [ ] `HomePage.tsx` — 메인 페이지 컴포넌트
  - [ ] fixed canvas 요소
  - [ ] 7개 섹션 div (각 min-h-screen)
  - [ ] 기존 `src/pages/HomePage.tsx`에서 import 연결
- [ ] `components/shared/SectionText.tsx` — 재사용 텍스트 블록
- [ ] `components/hero/HeroSection.tsx` — 타이틀 + 태그라인 + CTA
- [ ] `components/features/FeatureExplorer.tsx` — 3D 파일 탐색기 텍스트
- [ ] `components/features/FeatureDragDrop.tsx` — 드래그 앤 드롭 텍스트
- [ ] `components/features/FeatureContextMenu.tsx` — 컨텍스트 메뉴 텍스트
- [ ] `components/features/FeaturePreview.tsx` — 파일 미리보기 텍스트
- [ ] `components/features/FeatureCamera.tsx` — 카메라 컨트롤 텍스트
- [ ] `components/footer/FooterCTA.tsx` — 최종 CTA
- [ ] `animations/text-animations.ts` — 텍스트 reveal 애니메이션

**→ Phase 3 완료 후 유저 확인**

## Phase 4: 섹션별 3D 효과

- [ ] `three/objects/node-cluster.ts` — 트리 클러스터 레이아웃 좌표 계산
  - [ ] clusterPosition attribute 데이터 생성
  - [ ] 연결선 LineSegments (dashed material)
- [ ] `three/effects/drag-trail.ts` — 드래그 & 트레일 (Section 3)
  - [ ] 노드 분리 + 베지어 곡선 이동
  - [ ] 글로우 트레일 효과
  - [ ] 목표 폴더 펄스 애니메이션
- [ ] `components/overlay/ContextMenuOverlay.tsx` — HTML 오버레이 (Section 4)
  - [ ] 3D→2D 좌표 변환 (Vector3.project)
  - [ ] glassmorphism 카드
- [ ] `components/overlay/PreviewOverlay.tsx` — HTML 오버레이 (Section 5)
  - [ ] 프리뷰 카드 glassmorphism
- [ ] `three/effects/highlight.ts` — 노드 하이라이트/펄스 (Section 4-5)
- [ ] `three/objects/orbit-ring.ts` — 카메라 궤도 링 (Section 6)
  - [ ] orbitTheta 애니메이션
  - [ ] TorusGeometry

**→ Phase 4 완료 후 유저 확인**

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
